#!/usr/bin/env node
/*
  scripts/makeAdmin.js
  Usage:
    # using a service account JSON file path
    FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/key.json npm run make-admin -- <UID>

    # or using raw JSON in env (not recommended for long-term)
    FIREBASE_SERVICE_ACCOUNT='{...}' npm run make-admin -- <UID>

  For CI: provide FIREBASE_SERVICE_ACCOUNT_PATH and run with --yes to skip confirmation.
*/

const fs = require('fs');
const admin = require('firebase-admin');

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: npm run make-admin -- <UID> [--yes]');
    process.exit(1);
  }

  const uid = argv[0];
  const skipConfirm = argv.includes('--yes');

  let serviceAccountJson = null;
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      serviceAccountJson = JSON.parse(fs.readFileSync(p, 'utf8'));
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      console.error('Please set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT environment variable pointing to a service account JSON.');
      process.exit(2);
    }
  } catch (err) {
    console.error('Failed to read or parse service account JSON:', err.message || err);
    process.exit(2);
  }

  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccountJson) });
    const db = admin.firestore();

    const confirmAndProceed = async () => {
      if (skipConfirm) return true;
      process.stdout.write(`About to set roles/${uid}.admin = true. Continue? (y/N): `);
      return new Promise((resolve) => {
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', (data) => {
          const answer = String(data).trim().toLowerCase();
          resolve(answer === 'y' || answer === 'yes');
        });
      });
    };

    const ok = await confirmAndProceed();
    if (!ok) {
      console.log('Aborted. No changes made.');
      process.exit(0);
    }

    await db.collection('roles').doc(uid).set({ admin: true }, { merge: true });
    console.log(`Success: roles/${uid} set to admin = true`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to set admin role:', err.message || err);
    process.exit(3);
  }
}

main();
