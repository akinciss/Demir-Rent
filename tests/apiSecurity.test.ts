import { describe, it, expect, vi } from "vitest";
import { POST as addCarPOST } from "../src/app/api/admin/cars/route";

// Mock firebaseAdmin to prevent real calls
vi.mock("@/lib/firebaseAdmin", () => ({
  getAdminAuth: () => ({
    verifyIdToken: vi.fn(async (token) => {
      if (token === "valid_admin_token") return { uid: "admin_uid" };
      if (token === "valid_user_token") return { uid: "user_uid" };
      throw new Error("Invalid token");
    })
  }),
  getAdminFirestore: () => ({
    collection: () => ({
      doc: (uid: string) => ({
        get: vi.fn(async () => {
          if (uid === "admin_uid") return { exists: true, data: () => ({ admin: true }) };
          return { exists: true, data: () => ({ admin: false }) };
        })
      }),
      add: vi.fn(async () => ({ id: "new_mock_car_id" }))
    })
  })
}));

describe("API Security Tests - /api/admin/cars", () => {
  it("Token olmadan (401) dönmeli", async () => {
    const request = new Request("http://localhost/api/admin/cars", {
      method: "POST",
      body: JSON.stringify({ brand: "Test" })
    });
    const response = await addCarPOST(request);
    expect(response.status).toBe(401);
  });

  it("Geçersiz token ile (401) dönmeli", async () => {
    const request = new Request("http://localhost/api/admin/cars", {
      method: "POST",
      headers: { Authorization: "Bearer invalid_token" },
      body: JSON.stringify({ brand: "Test" })
    });
    const response = await addCarPOST(request);
    expect(response.status).toBe(401);
  });

  it("Admin olmayan normal kullanıcı (403) dönmeli", async () => {
    const request = new Request("http://localhost/api/admin/cars", {
      method: "POST",
      headers: { Authorization: "Bearer valid_user_token" },
      body: JSON.stringify({ brand: "Test" })
    });
    const response = await addCarPOST(request);
    expect(response.status).toBe(403);
  });

  it("Geçersiz body (eksik alanlar) ile 400 dönmeli (Admin Token)", async () => {
    const request = new Request("http://localhost/api/admin/cars", {
      method: "POST",
      headers: { Authorization: "Bearer valid_admin_token" },
      body: JSON.stringify({ brand: "Test" }) // Missing model, price, image
    });
    const response = await addCarPOST(request);
    expect(response.status).toBe(400);
  });

  it("Geçerli veri ve Admin token ile (201) dönmeli", async () => {
    const request = new Request("http://localhost/api/admin/cars", {
      method: "POST",
      headers: { Authorization: "Bearer valid_admin_token" },
      body: JSON.stringify({
        brand: "Test",
        model: "Car",
        pricePerDay: 500,
        image: "/test.jpg"
      })
    });
    const response = await addCarPOST(request);
    expect(response.status).toBe(201);
  });
});
