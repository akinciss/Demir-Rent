/*
  Basit migration script: cars koleksiyonundaki eksik alanları düzeltir.
  Çalıştırma:
    - Ortam değişkeni `GOOGLE_APPLICATION_CREDENTIALS` ile service account JSON yolunu verin
    - veya `FIREBASE_SERVICE_ACCOUNT` içine JSON string koyup parse edin
    - Ardından: `node -r ts-node/register scripts/migrations/fixCars.ts`
*/

import admin from "firebase-admin";

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
if (serviceAccountEnv) {
  try {
    const parsed = JSON.parse(serviceAccountEnv);
    admin.initializeApp({ credential: admin.credential.cert(parsed as any) });
  } catch (err) {
    console.error("FIREBASE_SERVICE_ACCOUNT parse error:", err);
    process.exit(1);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp();
} else {
  console.error("No service account provided. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT.");
  process.exit(1);
}

const db = admin.firestore();

async function fixCars() {
  const carsRef = db.collection("cars");
  const snapshot = await carsRef.get();
  console.log(`Found ${snapshot.size} car documents`);

  const defaultType = "Sedan";
  const defaultCapacity = 4;

  const batch = db.batch();
  let updates = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const update: any = {};
    if (!data.type) update.type = defaultType;
    if (!data.capacity && (data.seats || true)) update.capacity = data.capacity || data.seats || defaultCapacity;
    if (Object.keys(update).length > 0) {
      batch.update(doc.ref, update);
      updates++;
    }
  });

  if (updates > 0) {
    console.log(`Applying ${updates} updates...`);
    await batch.commit();
    console.log("Migration completed.");
  } else {
    console.log("No updates required.");
  }
}

fixCars().catch(err => {
  console.error(err);
  process.exit(1);
});
