import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/admin/reject
 *
 * Admin bir rezervasyonu reddeder (onay_bekliyor → reddedildi).
 * Transaction içinde:
 *  1. Admin token + rol doğrulama
 *  2. Rental var mı, onay_bekliyor durumunda mı?
 *  3. Rental status → "reddedildi"
 *  4. İlişkili slot → tekrar "available"
 *
 * Body: { rentalId: string, reason?: string }
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
  let reason: string | undefined;
  try {
    const body = await request.json();
    rentalId = body.rentalId;
    reason = typeof body.reason === "string" ? body.reason.trim() : undefined;
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
          `Bu rezervasyon '${rental.status}' durumunda, reddedilemez.`,
          409
        );
      }

      // Slot'u tekrar available yap
      if (rental.slotId) {
        const slotRef = db.collection("carSlots").doc(rental.slotId as string);
        const slotSnap = await transaction.get(slotRef);
        if (slotSnap.exists) {
          transaction.update(slotRef, { status: "available" });
        }
      }

      // Rental güncelle
      const update: Record<string, unknown> = {
        status: "rejected",
        rejectedAt: FieldValue.serverTimestamp(),
        rejectedBy: uid,
      };
      if (reason) update.rejectionReason = reason;

      transaction.update(rentalRef, update);
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
    console.error("Admin ret transaction hatası:", err);
    return NextResponse.json({ error: "Red işlemi sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

class ApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}
