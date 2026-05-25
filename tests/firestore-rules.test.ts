import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rulesPath = resolve(__dirname, "../firestore.rules");
  testEnv = await initializeTestEnvironment({
    projectId: "demir-rent-test",
    firestore: {
      rules: readFileSync(rulesPath, "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Firestore Security Rules", () => {
  const ALICE_UID = "alice_user_id";
  const BOB_UID = "bob_user_id";

  // Helper context creation
  const unauthedDb = () => testEnv.unauthenticatedContext().firestore();
  const aliceDb = () => testEnv.authenticatedContext(ALICE_UID).firestore();
  const bobDb = () => testEnv.authenticatedContext(BOB_UID).firestore();

  describe("cars collection", () => {
    it("Misafir kullanıcı araçları (cars) okuyabilmeli", async () => {
      const db = unauthedDb();
      await assertSucceeds(db.collection("cars").doc("car1").get());
    });

    it("Oturum açmış kullanıcı araç (cars) oluşturamamalı", async () => {
      const db = aliceDb();
      await assertFails(db.collection("cars").doc("car1").set({ brand: "Test" }));
    });
  });

  describe("carSlots collection", () => {
    it("Misafir kullanıcı slotları (carSlots) okuyabilmeli", async () => {
      const db = unauthedDb();
      await assertSucceeds(db.collection("carSlots").doc("slot1").get());
    });

    it("Oturum açmış kullanıcı slot (carSlots) oluşturamamalı", async () => {
      const db = aliceDb();
      await assertFails(db.collection("carSlots").doc("slot1").set({ startAt: "2023-01-01" }));
    });
  });

  describe("rentals collection", () => {
    beforeEach(async () => {
      // Simulate existing data setup via admin context (bypasses rules)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.collection("rentals").doc("alice_rental").set({ userId: ALICE_UID });
      });
    });

    it("Kullanıcı sadece kendi rental kayıtlarını okuyabilmeli", async () => {
      const db = aliceDb();
      await assertSucceeds(db.collection("rentals").doc("alice_rental").get());
    });

    it("Kullanıcı başkasının rental kayıtlarını okuyamamalı", async () => {
      const db = bobDb();
      await assertFails(db.collection("rentals").doc("alice_rental").get());
    });

    it("Client rentals create yapamamalı (yetkili olsa bile)", async () => {
      const db = aliceDb();
      await assertFails(db.collection("rentals").doc("new_rental").set({ userId: ALICE_UID }));
    });

    it("Client rentals update yapamamalı", async () => {
      const db = aliceDb();
      await assertFails(db.collection("rentals").doc("alice_rental").update({ status: "active" }));
    });
  });

  describe("users collection", () => {
    it("Kullanıcı sadece kendi profilini güncelleyebilmeli", async () => {
      const db = aliceDb();
      await assertSucceeds(db.collection("users").doc(ALICE_UID).update({ name: "Alice" }));
      await assertFails(db.collection("users").doc(BOB_UID).update({ name: "Alice" }));
    });

    it("Client tarafında users create işlemi kapalı olmalı", async () => {
      const db = aliceDb();
      await assertFails(db.collection("users").doc(ALICE_UID).set({ name: "Alice" }));
    });
  });
});
