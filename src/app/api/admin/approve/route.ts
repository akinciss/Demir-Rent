import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/admin/approve
 *
 * Admin bir rezervasyonu onaylar.
 * Transaction içinde:
 *  1. Admin token doğrulama
 *  2. Rental var mı, pending durumunda mı?
 *  3. Slot var mı, hâlâ bu rental'a reserved mı? (slotId varsa)
 *  4. Başka active çakışan rental var mı?
 *  5. Rental status → "active"
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

  // 2. Admin rolü kontrolü (Firestore roles/{uid}.admin == true)
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

      if (rental.status !== "pending") {
        throw new ApiError(
          `Bu rezervasyon zaten '${rental.status}' durumunda, onaylanamaz.`,
          409
        );
      }

      // Slot kontrolü (slotId varsa)
      if (rental.slotId) {
        const slotRef = db.collection("carSlots").doc(rental.slotId as string);
        const slotSnap = await transaction.get(slotRef);

        if (!slotSnap.exists) {
          throw new ApiError("İlgili slot bulunamadı.", 404);
        }

        const slot = slotSnap.data()!;

        if (slot.status !== "reserved") {
          throw new ApiError(
            "İlgili slot artık rezerve durumda değil. Onaylama iptal edildi.",
            409
          );
        }
      }

      // Çakışan aktif rezervasyon kontrolü (aynı araç, active)
      const conflictSnap = await transaction.get(
        db.collection("rentals")
          .where("carId", "==", rental.carId)
          .where("status", "==", "active")
      );

      if (!conflictSnap.empty) {
        const newStart = new Date(rental.startDate).getTime();
        const newEnd = new Date(rental.endDate).getTime();

        for (const doc of conflictSnap.docs) {
          if (doc.id === rentalId) continue;

          const c = doc.data();
          const existingStart = new Date(c.startDate).getTime();
          const existingEnd = new Date(c.endDate).getTime();

          // Kesişim (Overlap) Formülü: Başlangıç bitişten önce, bitiş başlangıçtan sonra
          if (newStart < existingEnd && newEnd > existingStart) {
            throw new ApiError(
              `Bu araç için çakışan aktif bir rezervasyon mevcut (${c.startDate} - ${c.endDate}).`,
              409
            );
          }
        }
      }

      // Onayı işle
      transaction.update(rentalRef, {
        status: "active",
        approvedAt: FieldValue.serverTimestamp(),
        approvedBy: uid,
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
    // eslint-disable-next-line no-console
    console.error("Admin onay transaction hatası:", err);
    return NextResponse.json({ error: "Onay işlemi sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

class ApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}
