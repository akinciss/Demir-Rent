/**
 * Firebase Admin SDK — server-only, lazy initialization.
 *
 * Bu modül SADECE API route'lardan import edilmeli.
 * Page/layout/component seviyesinde import edilirse demo mode bozulur.
 *
 * service-account.json yoksa init başarısız olur ama uygulama çökmez —
 * hata sadece API route çağrıldığında fırlatılır.
 */
import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

let _adminApp: App | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    _adminApp = existing[0];
    return _adminApp;
  }

  const serviceAccountPath = resolve(process.cwd(), "service-account.json");

  if (!existsSync(serviceAccountPath)) {
    throw new Error(
      "ADMIN_SDK_NOT_CONFIGURED: service-account.json bulunamadı. " +
      "Rezervasyon API'si çalışamaz."
    );
  }

  const serviceAccount = JSON.parse(
    readFileSync(serviceAccountPath, "utf-8")
  ) as ServiceAccount;

  _adminApp = initializeApp({ credential: cert(serviceAccount) });
  return _adminApp;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
