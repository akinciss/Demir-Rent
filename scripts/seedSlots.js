const admin = require('firebase-admin');
const path = require('path');

// Load environment variables manually
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Either use service account or fallback to default application credentials
let serviceAccount;
try {
  serviceAccount = require('../service-account.json');
} catch (e) {
  console.log('service-account.json not found, attempting default initialization...');
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

// Helper to format Date to YYYY-MM-DD in local/timezone-safe way
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function seedSlots() {
  console.log('Starting car slots seed process...');
  const carsSnapshot = await db.collection('cars').get();
  
  if (carsSnapshot.empty) {
    console.log('No cars found in Firestore. Cannot create slots.');
    return;
  }

  let totalSlotsCreated = 0;
  let carsProcessed = 0;
  let skippedDueToOverlap = 0;

  for (const doc of carsSnapshot.docs) {
    const carId = doc.id;
    const carData = doc.data();

    // 3. Sadece aktif (isActive !== false) araçlara slot ekle.
    if (carData.isActive === false) {
      console.log(`Skipping car ${carId} (${carData.brand}): It is marked as inactive.`);
      continue;
    }
    
    // Fetch all existing slots for this car to check for duplicates/overlaps
    const slotsSnapshot = await db.collection('carSlots').where('carId', '==', carId).get();
    const existingSlots = slotsSnapshot.docs.map(s => s.data());

    // 4. Geçmiş tarihli slot oluşturma ihtimalini sıfırla. (Bugünden sonrasını kullanıyoruz)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Target Slot 1: Starts in 2 days, ends in 7 days
    const start1 = new Date(today);
    start1.setDate(today.getDate() + 2);
    const end1 = new Date(start1);
    end1.setDate(start1.getDate() + 5);

    // Target Slot 2: Starts in 15 days, ends in 24 days
    const start2 = new Date(today);
    start2.setDate(today.getDate() + 15);
    const end2 = new Date(start2);
    end2.setDate(start2.getDate() + 9);

    const targets = [
      { start: formatDate(start1), end: formatDate(end1) },
      { start: formatDate(start2), end: formatDate(end2) }
    ];

    let slotsCreatedForThisCar = 0;

    for (const target of targets) {
      // 1 & 5. Idempotent & overlap check.
      // A slot overlaps if max(start1, start2) <= min(end1, end2)
      const hasOverlap = existingSlots.some(existing => {
        return Math.max(new Date(existing.startAt).getTime(), new Date(target.start).getTime()) <= 
               Math.min(new Date(existing.endAt).getTime(), new Date(target.end).getTime());
      });

      if (hasOverlap) {
        skippedDueToOverlap++;
        // We log silently or you can enable console.log here
        continue;
      }

      try {
        await db.collection('carSlots').add({
          carId,
          startAt: target.start,
          endAt: target.end,
          status: 'available'
        });
        slotsCreatedForThisCar++;
        totalSlotsCreated++;
        // Add to our local array so the next target in the loop is checked against the newly added slot
        existingSlots.push({ startAt: target.start, endAt: target.end });
      } catch (error) {
        // 7. Yarım kalan işlemler veya hatalar için açıklayıcı log
        console.error(`\n[ERROR] Failed to create slot for car ${carId} (${target.start} -> ${target.end})`);
        console.error(`Reason: ${error.message}\n`);
      }
    }

    if (slotsCreatedForThisCar > 0) {
      console.log(`Car ${carId} (${carData.brand || 'Unknown'}): Added ${slotsCreatedForThisCar} new slots.`);
    }
    carsProcessed++;
  }

  // 6. Net sonuç loglaması
  console.log('\n--- Seed Process Summary ---');
  console.log(`Total cars processed : ${carsProcessed}`);
  console.log(`Total slots created  : ${totalSlotsCreated}`);
  console.log(`Skipped (overlapping): ${skippedDueToOverlap}`);
  console.log('----------------------------\n');
}

seedSlots().then(() => {
  console.log('Seed completed successfully.');
  process.exit(0);
}).catch(err => {
  console.error('\n[CRITICAL FATAL ERROR] Seed process failed abruptly:');
  console.error(err);
  process.exit(1);
});
