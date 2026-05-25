import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebaseAdmin";

/**
 * Helper to verify admin token.
 */
async function verifyAdmin(request: Request): Promise<{ uid: string } | NextResponse> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Yetkilendirme başlığı eksik." }, { status: 401 });
  }

  const idToken = authHeader.slice(7);
  let uid: string;

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş oturum." }, { status: 401 });
  }

  try {
    const db = getAdminFirestore();
    const roleSnap = await db.collection("roles").doc(uid).get();
    if (!roleSnap.exists || roleSnap.data()?.admin !== true) {
      return NextResponse.json({ error: "Bu işlem için admin yetkisi gerekiyor." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Yetki kontrolü başarısız." }, { status: 500 });
  }

  return { uid };
}

/**
 * POST /api/admin/slots
 * Yeni slot ekler (tarih çakışma kontrolüyle).
 */
export async function POST(request: Request) {
  const authRes = await verifyAdmin(request);
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await request.json();
    const { carId, startAt, endAt, status = "available" } = body;

    if (!carId || !startAt || !endAt) {
      return NextResponse.json({ error: "Eksik parametreler (carId, startAt, endAt)." }, { status: 400 });
    }

    const newStart = new Date(startAt).getTime();
    const newEnd = new Date(endAt).getTime();

    if (isNaN(newStart) || isNaN(newEnd)) {
      return NextResponse.json({ error: "Geçersiz tarih formatı." }, { status: 400 });
    }

    if (newStart >= newEnd) {
      return NextResponse.json({ error: "Başlangıç tarihi bitiş tarihinden önce olmalıdır." }, { status: 400 });
    }

    const db = getAdminFirestore();

    // Çakışan slot kontrolü
    const slotsSnap = await db.collection("carSlots")
      .where("carId", "==", carId)
      .get();

    for (const doc of slotsSnap.docs) {
      const existing = doc.data();
      const existingStart = new Date(existing.startAt).getTime();
      const existingEnd = new Date(existing.endAt).getTime();

      // Overlap kontrolü: newStart < existingEnd && newEnd > existingStart
      if (newStart < existingEnd && newEnd > existingStart) {
        return NextResponse.json(
          { error: `Bu tarih aralığı mevcut bir slot ile çakışıyor (${existing.startAt} - ${existing.endAt}).` },
          { status: 400 }
        );
      }
    }

    // Çakışma yok, ekle
    const slotRef = await db.collection("carSlots").add({
      carId,
      startAt,
      endAt,
      status,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ id: slotRef.id, message: "Slot başarıyla eklendi." }, { status: 201 });
  } catch (err) {
    console.error("Slot ekleme hatası:", err);
    return NextResponse.json({ error: "Slot eklenirken sunucu hatası oluştu." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/slots
 * Slot siler (sadece 'available' olanlar silinebilir).
 */
export async function DELETE(request: Request) {
  const authRes = await verifyAdmin(request);
  if (authRes instanceof NextResponse) return authRes;

  try {
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get("slotId");

    if (!slotId) {
      return NextResponse.json({ error: "Geçersiz slotId." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const slotRef = db.collection("carSlots").doc(slotId);
    const slotSnap = await slotRef.get();

    if (!slotSnap.exists) {
      return NextResponse.json({ error: "Slot bulunamadı." }, { status: 404 });
    }

    const slotData = slotSnap.data();
    if (slotData?.status && slotData.status !== "available") {
      return NextResponse.json({ error: "Sadece müsait (available) slotlar silinebilir." }, { status: 400 });
    }

    await slotRef.delete();
    return NextResponse.json({ message: "Slot başarıyla silindi." });
  } catch (err) {
    console.error("Slot silme hatası:", err);
    return NextResponse.json({ error: "Slot silinirken sunucu hatası oluştu." }, { status: 500 });
  }
}
