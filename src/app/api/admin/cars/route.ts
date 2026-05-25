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
 * POST /api/admin/cars
 * Yeni araç ekler.
 */
export async function POST(request: Request) {
  const authRes = await verifyAdmin(request);
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await request.json();
    const { brand, model, pricePerDay, image } = body;

    if (!brand || !model || !pricePerDay || !image) {
      return NextResponse.json({ error: "Eksik parametreler (brand, model, pricePerDay, image)." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const carRef = await db.collection("cars").add({
      ...body,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ id: carRef.id, message: "Araç başarıyla eklendi." }, { status: 201 });
  } catch (err) {
    console.error("Araç ekleme hatası:", err);
    return NextResponse.json({ error: "Araç eklenirken sunucu hatası oluştu." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/cars
 * Araç siler.
 */
export async function DELETE(request: Request) {
  const authRes = await verifyAdmin(request);
  if (authRes instanceof NextResponse) return authRes;

  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get("carId");

    if (!carId) {
      return NextResponse.json({ error: "Geçersiz carId." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const carRef = db.collection("cars").doc(carId);
    const carSnap = await carRef.get();

    if (!carSnap.exists) {
      return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });
    }

    await carRef.delete();
    return NextResponse.json({ message: "Araç başarıyla silindi." });
  } catch (err) {
    console.error("Araç silme hatası:", err);
    return NextResponse.json({ error: "Araç silinirken sunucu hatası oluştu." }, { status: 500 });
  }
}

/**
 * PUT /api/admin/cars
 * Araç günceller.
 */
export async function PUT(request: Request) {
  const authRes = await verifyAdmin(request);
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Geçersiz carId." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const carRef = db.collection("cars").doc(id);
    const carSnap = await carRef.get();

    if (!carSnap.exists) {
      return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });
    }

    await carRef.update(updateData);
    return NextResponse.json({ message: "Araç başarıyla güncellendi." });
  } catch (err) {
    console.error("Araç güncelleme hatası:", err);
    return NextResponse.json({ error: "Araç güncellenirken sunucu hatası oluştu." }, { status: 500 });
  }
}
