import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// ── Fiyat Hesaplama (server-side, saf fonksiyon) ──────────────────
// rentalService.calculateDynamicPrice ile aynı mantık.
// Client modüllerini server'a import etmemek için burada tekrarlanıyor.

function calculatePricing(
  pricePerDay: number,
  startDateInput: unknown,
  endDateInput: unknown
) {
  const getISOString = (val: unknown) => {
    if (val && typeof val === "object" && "toDate" in val && typeof (val as { toDate: () => unknown }).toDate === "function") {
      const d = (val as { toDate: () => unknown }).toDate();
      if (d instanceof Date) {
        return d.toISOString().split("T")[0];
      }
    }
    if (val instanceof Date) {
      return val.toISOString().split("T")[0];
    }
    return String(val);
  };

  const startDateStr = getISOString(startDateInput);
  const endDateStr = getISOString(endDateInput);

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  let totalPrice = 0;
  for (let i = 0; i < diffDays; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    const dayOfWeek = day.getDay(); // 0 = Pazar, 6 = Cumartesi
    totalPrice += dayOfWeek === 0 || dayOfWeek === 6
      ? pricePerDay * 1.25
      : pricePerDay;
  }

  return { 
    totalPrice: Math.round(totalPrice), 
    totalDays: diffDays,
    startDate: startDateStr,
    endDate: endDateStr
  };
}

// ── POST /api/rentals/reserve ─────────────────────────────────────

export async function POST(request: Request) {
  // 1. Auth token doğrulama
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Yetkilendirme başlığı eksik. Lütfen giriş yapın." },
      { status: 401 }
    );
  }

  const idToken = authHeader.slice(7);

  let uid: string;
  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın." },
      { status: 401 }
    );
  }

  // 2. Request body — kullanıcı SADECE slotId ve receiptInfo gönderir
  let slotId: string;
  let receiptInfo: string;
  try {
    const body = await request.json();
    slotId = body.slotId;
    receiptInfo = body.receiptInfo;

    if (!slotId || typeof slotId !== "string") {
      return NextResponse.json(
        { error: "Geçersiz slot bilgisi." },
        { status: 400 }
      );
    }
    if (!receiptInfo || typeof receiptInfo !== "string" || !receiptInfo.trim()) {
      return NextResponse.json(
        { error: "Dekont / referans bilgisi zorunludur." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek formatı." },
      { status: 400 }
    );
  }

  // 3. Firestore Transaction
  try {
    const db = getAdminFirestore();
    const slotRef = db.collection("carSlots").doc(slotId);

    const rentalId = await db.runTransaction(async (transaction) => {
      // 3a. Slot dokümanını oku
      const slotSnap = await transaction.get(slotRef);

      if (!slotSnap.exists) {
        throw new TransactionError(
          "Slot bulunamadı.",
          404
        );
      }

      const slotData = slotSnap.data()!;

      // 3b. Slot durumu kontrolü
      if (slotData.status !== "available") {
        throw new TransactionError(
          "Bu tarih aralığı az önce başka bir kullanıcı tarafından rezerve edildi.",
          409
        );
      }

      // 3c. Araç bilgilerini oku (carId slot'tan alınıyor, body'den değil)
      const carId = slotData.carId as string;
      const carRef = db.collection("cars").doc(carId);
      const carSnap = await transaction.get(carRef);

      if (!carSnap.exists) {
        throw new TransactionError(
          "Araca ait bilgi bulunamadı.",
          404
        );
      }

      const carData = carSnap.data()!;
      const pricePerDay = carData.pricePerDay as number;
      const startDateInput = slotData.startAt;
      const endDateInput = slotData.endAt;

      // 3d. Fiyat ve gün sayısını hesapla (hafta sonu çarpanı dahil, güvenli Timestamp parse)
      const { totalPrice, totalDays, startDate, endDate } = calculatePricing(
        pricePerDay,
        startDateInput,
        endDateInput
      );

      // 3e. Slot status → 'reserved'
      transaction.update(slotRef, { status: "reserved" });

      // 3f. Rental dokümanı oluştur
      const rentalRef = db.collection("rentals").doc();
      transaction.set(rentalRef, {
        userId: uid,
        carId,
        slotId,
        startDate,
        endDate,
        status: "pending",
        receiptInfo: receiptInfo.trim(),
        pricePerDay,
        totalDays,
        totalPrice,
        createdAt: FieldValue.serverTimestamp(),
      });

      return rentalRef.id;
    });

    return NextResponse.json({ rentalId }, { status: 201 });
  } catch (err) {
    // Transaction hataları
    if (err instanceof TransactionError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      );
    }

    // Admin SDK config hatası
    if (err instanceof Error && err.message.includes("ADMIN_SDK_NOT_CONFIGURED")) {
      return NextResponse.json(
        { error: "Sunucu yapılandırması eksik. Lütfen yönetici ile iletişime geçin." },
        { status: 503 }
      );
    }

    // Beklenmeyen hata
    // eslint-disable-next-line no-console
    console.error("Rezervasyon transaction hatası:", err);
    return NextResponse.json(
      { error: "Rezervasyon oluşturulurken beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}

// ── Yardımcı: Transaction içinden fırlatılan tipli hata ───────────

class TransactionError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "TransactionError";
  }
}
