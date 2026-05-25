# Demir Rent — Premium Araç Kiralama Sistemi

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)

---

## Proje Hakkında

**Demir Rent**, şık ve bohem tasarımıyla kullanıcılara premium bir araç kiralama deneyimi sunan modern bir web uygulamasıdır.

- Kullanıcılar, geniş araç yelpazesini gelişmiş filtreleme seçenekleriyle inceleyebilir.
- **Slot sistemi** ile araçlar için belirlenmiş tarih aralıklarından rezervasyon yapılır.
- Ödeme bildirimi (banka havalesi / EFT referans no) ile kiralama talebi oluşturulur.
- Admin panelinde yöneticiler rezervasyonları onaylar, reddeder, iptal eder veya tamamlandı olarak işaretler.

---

## Özellikler

| Özellik | Açıklama |
|---|---|
| 🔐 Firebase Authentication | Güvenli giriş, kayıt ve oturum yönetimi |
| 📅 Slot Bazlı Rezervasyon | Araç başına admin tarafından tanımlanan müsait tarih aralıkları |
| 💰 Server-Side Fiyat Hesaplama | Fiyat client'tan alınmaz; sunucu araç fiyatı + tarih aralığından hesaplar |
| 🔒 Firestore Transaction | Aynı anda iki kişi aynı slotu rezerve edemez |
| 🛡️ Güvenli Admin API | Onay/red/iptal/tamamlama işlemleri sunucu taraflı, transaction içinde |
| ⚖️ Role Bazlı Yetki | Admin rolü `roles/{uid}.admin == true` ile doğrulanır |
| 🎨 Premium Tasarım | Glassmorphism, Framer Motion animasyonları, Playfair Display tipografisi |

---

## Teknoloji Stack

| Katman | Teknoloji |
|---|---|
| **Framework** | [Next.js 16.2.6](https://nextjs.org/) (App Router) |
| **UI** | [React 19.2.4](https://react.dev/) |
| **Veritabanı** | [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| **Kimlik Doğrulama** | [Firebase Auth](https://firebase.google.com/docs/auth) |
| **Admin SDK** | [Firebase Admin SDK 13](https://firebase.google.com/docs/admin/setup) (server-only) |
| **Animasyon** | [Framer Motion 12](https://www.framer.com/motion/) |
| **İkonlar** | [Lucide React 1.16](https://lucide.dev/) |
| **Stil** | Tailwind CSS 4 + Vanilla CSS variables |
| **Test** | [Vitest 1.3](https://vitest.dev/) |
| **Bildirim** | [React Hot Toast 2](https://react-hot-toast.com/) |

---

## Kurulum

### Gereksinimler

- Node.js v18 veya üzeri
- NPM
- Aktif bir Firebase projesi (Firestore + Auth aktif)

### 1. Klonlama

```bash
git clone <repository-url>
cd car-rental-system
npm install
```

### 2. Environment Variables (`.env.local`)

Proje dizininde `.env.local` dosyası oluşturun:

```bash
cp .env.example .env.local
```

Aşağıdaki değişkenleri Firebase konsolundan alıp doldurun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **Güvenlik Notu:** `.env.local` dosyasını asla GitHub'a yüklemeyin. `.gitignore` bunu zaten engelliyor.

### 3. Firebase Admin SDK (Service Account)

Server-side API route'ların çalışabilmesi için Firebase service account gereklidir:

1. Firebase Console → Proje Ayarları → Hizmet Hesapları → "Yeni Özel Anahtar Oluştur"
2. İndirilen JSON dosyasını proje kök dizinine `service-account.json` olarak kaydedin.

> **Güvenlik Notu:** `service-account.json` dosyasını asla Git'e commit etmeyin. `.gitignore`'da zaten hariç tutulmuştur.

### 4. Firestore Güvenlik Kuralları

```bash
npx firebase-tools deploy --only firestore:rules
```

Ya da Firebase Console'dan `firestore.rules` içeriğini manuel olarak yapıştırın.

### 5. Geliştirme Sunucusu

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

---

## Demo Mode

Firebase ayarları eksik olduğunda (`.env.local` yoksa):

- **Development ortamında:** Uygulama mock araç verisiyle çalışır. Rezervasyon API'leri çalışmaz.
- **Production ortamında:** Uygulama başlangıçta açık hata verir. Sessiz fallback yoktur.

---

## Rezervasyon Akışı

```
Kullanıcı slot seçer
        ↓
POST /api/rentals/reserve (Auth token + slotId + receiptInfo)
        ↓
Server: Token doğrula → Slot kontrol et (transaction) → Fiyat hesapla → Slot "reserved" yap → Rental oluştur
        ↓
Rental status: "onay_bekliyor"
        ↓
Admin panelinde görünür
        ↓
Admin ONAYLA → POST /api/admin/approve (transaction: slot "reserved" mi? çakışma var mı?)
Admin REDDET  → POST /api/admin/reject (slot tekrar "available")
        ↓
Rental status: "aktif" veya "reddedildi"
        ↓
Admin İPTAL  → POST /api/admin/cancel (slot tekrar "available")
Admin TAM.   → POST /api/admin/complete (slot "booked" kalır)
        ↓
Rental status: "iptal" veya "tamamlandi"
```

---

## Slot Sistemi

`carSlots` Firestore koleksiyonu; her araç için admin tarafından oluşturulan müsait tarih aralıklarını tutar.

| Alan | Tip | Açıklama |
|---|---|---|
| `carId` | `string` | İlgili araç ID'si |
| `startAt` | `string` (YYYY-MM-DD) | Başlangıç tarihi |
| `endAt` | `string` (YYYY-MM-DD) | Bitiş tarihi |
| `status` | `CarSlotStatus` | `available` \| `reserved` \| `booked` \| `closed` |

Slot yazma işlemi **yalnızca Admin API** veya Admin CLI üzerinden yapılır. Client-side `allow write: if false`.

---

## Rental Status Değerleri

```typescript
type RentalStatus =
  | "pending"     // Kullanıcı ödeme bildirdi, admin bekliyor
  | "active"      // Admin onayladı, kiralama aktif
  | "rejected"    // Admin reddetti (slot serbest)
  | "cancelled"   // Admin veya kullanıcı iptal etti (slot serbest)
  | "completed"   // Kiralama tamamlandı (slot geçmiş)
```

---

## Admin Paneli

Admin yetkisi için kullanıcının `roles/{uid}` dokümanında `admin: true` olmalıdır.

### Admin Atama

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/service-account.json \
  npm run make-admin -- <UID>
```

### Admin Paneli Yetkileri

- **Araç envanteri:** Araç ekleme (validasyonlu) ve silme
- **Slot Yönetimi (Yeni):** Araç seçip yeni müsait tarih aralıkları tanımlama (çakışma kontrollü) ve mevcut slotları silme.
- **Rezervasyon yönetimi:**
  - Sekmeli filtreleme (Bekleyen, Aktif, Tamamlanan, İptal Edilen, Tümü)
  - `pending` → Onayla / Reddet
  - `active` → Tamamlandı / İptal Et

---

## Test

```bash
npm test          # Tüm testleri çalıştır
npm test -- --run # Watch mode olmadan tek seferlik çalıştır
```

### Test Kapsamı

| Dosya | Kapsam |
|---|---|
| `tests/rentalService.test.ts` | Tarih çakışması, dinamik fiyat hesaplama |
| `tests/reserveApi.test.ts` | Server-side fiyat güvenliği, slot durum kontrolleri, eşzamanlı rezervasyon |
| `tests/adminApi.test.ts` | Admin status geçişleri, slot serbest bırakma, yetki kontrolleri |
| `tests/adminSlot.test.ts` | Admin slot çakışma (overlap) tespiti ve validasyonu |
| `tests/rentalStatus.test.ts` | TypeScript tip güvenliği, RentalStatus union, Car.id, isActive |

---

## Deploy

### Vercel (Önerilen)

1. Vercel dashboard'unda environment variables ekleyin (`.env.local` ile aynı).
2. `service-account.json` içeriğini `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable olarak ekleyin (tek satır JSON string).
3. Push → Otomatik deploy.

> **Not:** Production ortamında Firebase config eksikse uygulama açık hata verir, demo mode'a geçmez.

---

## Proje Sınırları

- **Ödeme entegrasyonu yoktur.** Sistem banka havalesi referans numarası üzerinden çalışır; otomatik ödeme doğrulaması yapılmaz.
- **Bildirim sistemi yoktur.** Admin onay sonrası kullanıcıya e-posta/SMS gönderilmez.
- **Firebase Storage kullanılmamaktadır.** Dekont yükleme özelliği yoktur; sadece metin referans numarası alınır.

---

## Lisans

Bu proje MIT lisansı ile dağıtılmaktadır.

---

*Demir Rent — Zarif bir sürüş deneyimi.*
