# Demir Rent - Premium Araç Kiralama Sistemi

## Açıklama
Demir Rent, şık ve bohem tasarımıyla kullanıcılara premium bir araç kiralama deneyimi sunan modern bir web uygulamasıdır. Kullanıcılar, geniş araç yelpazesini gelişmiş filtreleme seçenekleriyle inceleyebilir, kolayca kiralama talebi oluşturabilir ve Havale/EFT akışı ile ödemelerini bildirebilirler. Yönetim tarafında ise yetkili hesaplar, yeni araçlar ekleyebilir ve gelen rezervasyon/ödeme taleplerini onaylayabilirler.

### Öne Çıkan Özellikler
- **Kullanıcı Yetkilendirmesi (Auth):** Firebase Authentication ile güvenli giriş, kayıt ve oturum yönetimi.
- **Admin Paneli:** Sadece belirli yetkilere sahip yöneticilerin erişebildiği araç ekleme ve sipariş yönetimi ekranı.
- **Havale / EFT Akışı:** Kiralama adımında, kullanıcıdan dekont referans numarası talep ederek siparişi "onay bekliyor" durumuna alma özelliği.
- **Gelişmiş Filtreleme:** Araçlar sayfasında marka, araç tipi (SUV, Sedan vb.), bütçe ve uygunluk durumuna göre gerçek zamanlı çalışan modern filtreleme paneli.
- **Premium, Bohem Arayüz:** Tailwind CSS ile geliştirilmiş, yumuşak toprak tonlarına ve pürüzsüz animasyonlara sahip (glassmorphism ve akıcı geçişler) minimalist tasarım.
- **Siparişlerim:** Kullanıcıların kendi kiralama geçmişlerini ve sipariş durumlarını takip edebileceği özel sayfa.

## Teknolojiler
- **Framework:** Next.js (App Router, React 18)
- **Stil & Arayüz:** Tailwind CSS, Lucide React (İkonlar)
- **Veritabanı & Backend:** Firebase (Firestore)
- **Kimlik Doğrulama:** Firebase Auth

## Kurulum Adımları

### Gereksinimler
- Node.js (v18 veya üzeri)
- NPM veya Yarn
- Aktif bir Firebase projesi

### 1. Kurulum (Git Clone)
Projeyi kendi bilgisayarınıza indirmek için terminalinizde aşağıdaki komutu çalıştırın:
```bash
git clone <repository-url>
cd car-rental-system
npm install
```

### 2. Çevresel Değişkenler (Environment Variables)
Projenin Firebase ile iletişim kurabilmesi için API anahtarlarına ihtiyacı vardır. 
Ana dizinde bulunan `.env.example` dosyasının bir kopyasını oluşturup adını `.env.local` yapın:

```bash
cp .env.example .env.local
```

Oluşturduğunuz `.env.local` dosyasının içindeki boş alanları, Firebase konsolundan (Proje Ayarları > Web Uygulaması bölümünden) alacağınız bilgilerle doldurun.

> **Güvenlik Notu:** Hassas verilerinizi barındıran `.env`, `.env.local` gibi dosyalar KESİNLİKLE GitHub'a yüklenmemelidir. Bu projedeki `.gitignore` dosyası, hassas bilgilerin kazara push edilmesini engellemek için doğru şekilde yapılandırılmıştır. Lütfen güvenliği ihlal etmemek adına `.env.local` dosyasının hariç tutulduğundan emin olun.

### 3. Projeyi Başlatma
Gerekli bağımlılıkları yükledikten ve çevresel değişkenleri ayarladıktan sonra yerel sunucuyu başlatmak için:
```bash
npm run dev
```
Uygulama başarıyla derlendikten sonra tarayıcınızda `http://localhost:3000` adresine giderek sistemi inceleyebilirsiniz.

---
*Demir Rent - Zarif bir sürüş deneyimi.*
