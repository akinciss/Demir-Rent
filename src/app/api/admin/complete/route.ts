import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/admin/complete
 *
 * Admin aktif bir rezervasyonu tamamlandı olarak işaretler (aktif → tamamlandi).
 * Slot geçmiş kullanım olarak kalır — tekrar available yapılmaz.
 * Transaction içinde:
 *  1. Admin token + rol doğrulama
 *  2. Rental var mı, aktif durumunda mı?
 *  3. Rental status → "tamamlandi"
 *
 * Body: { rentalId: string }
 */
export async function POST(request: Request) {
  // 1. Admin token doğrulama
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

  // 2. Admin rolü kontrolü
  try {
    const db = getAdminFirestore();
    const roleSnap = await db.collection("roles").doc(uid).get();
    if (!roleSnap.exists || roleSnap.data()?.admin !== true) {
      return NextResponse.json({ error: "Bu işlem için admin yetkisi gerekiyor." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Yetki kontrolü başarısız." }, { status: 500 });
  }

  // 3. Body parse
  let rentalId: string;
  try {
    const body = await request.json();
    rentalId = body.rentalId;
    if (!rentalId || typeof rentalId !== "string") {
      return NextResponse.json({ error: "Geçersiz rentalId." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Geçersiz istek formatı." }, { status: 400 });
  }

  // 4. Transaction
  try {
    const db = getAdminFirestore();
    const rentalRef = db.collection("rentals").doc(rentalId);

    await db.runTransaction(async (transaction) => {
      const rentalSnap = await transaction.get(rentalRef);

      if (!rentalSnap.exists) {
        throw new ApiError("Rezervasyon bulunamadı.", 404);
      }

      const rental = rentalSnap.data()!;

      if (rental.status !== "active") {
        throw new ApiError(
          `Bu rezervasyon '${rental.status}' durumunda, tamamlanamaz. Sadece aktif rezervasyonlar tamamlanabilir.`,
          409
        );
      }

      // Slot geçmiş kullanım olarak kalır — "booked" olarak işaretle (opsiyonel)
      // Gereksinimlere göre: tamamlandıysa slot available yapılmaz, geçmiş kayıt olarak kalır.
      if (rental.slotId) {
        const slotRef = db.collection("carSlots").doc(rental.slotId as string);
        const slotSnap = await transaction.get(slotRef);
        if (slotSnap.exists) {
          transaction.update(slotRef, { status: "booked" });
        }
      }

      // Rental güncelle
      transaction.update(rentalRef, {
        status: "completed",
        completedAt: FieldValue.serverTimestamp(),
        completedBy: uid,
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    if (err instanceof Error && err.message.includes("ADMIN_SDK_NOT_CONFIGURED")) {
      return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 503 });
    }
    console.error("Admin tamamlandı transaction hatası:", err);
    return NextResponse.json({ error: "Tamamlama işlemi sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

class ApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}
