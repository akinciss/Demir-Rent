import { describe, it, expect } from "vitest";

// Local simulation of slot conflict checking logic matching the API implementation.
interface CarSlot {
  id: string;
  carId: string;
  startAt: string;
  endAt: string;
  status: "available" | "reserved" | "booked" | "closed";
}

function checkSlotConflict(newSlot: Omit<CarSlot, "id">, existingSlots: CarSlot[]): { conflict: boolean; conflictingSlot?: CarSlot } {
  const newStart = new Date(newSlot.startAt).getTime();
  const newEnd = new Date(newSlot.endAt).getTime();

  if (isNaN(newStart) || isNaN(newEnd)) {
    throw new Error("Geçersiz tarih formatı.");
  }
  if (newStart >= newEnd) {
    throw new Error("Başlangıç tarihi bitiş tarihinden önce olmalıdır.");
  }

  for (const slot of existingSlots) {
    if (slot.carId !== newSlot.carId) continue;

    const existingStart = new Date(slot.startAt).getTime();
    const existingEnd = new Date(slot.endAt).getTime();

    // Overlap Formula: newStart < existingEnd && newEnd > existingStart
    if (newStart < existingEnd && newEnd > existingStart) {
      return { conflict: true, conflictingSlot: slot };
    }
  }

  return { conflict: false };
}

describe("Admin Slot Conflict Detection", () => {
  const existingSlots: CarSlot[] = [
    {
      id: "slot-1",
      carId: "car-a",
      startAt: "2026-06-01",
      endAt: "2026-06-10",
      status: "available",
    },
    {
      id: "slot-2",
      carId: "car-a",
      startAt: "2026-06-15",
      endAt: "2026-06-20",
      status: "booked",
    },
    {
      id: "slot-3",
      carId: "car-b",
      startAt: "2026-06-05",
      endAt: "2026-06-12",
      status: "available",
    },
  ];

  it("should allow a slot with no overlapping dates", () => {
    const newSlot = {
      carId: "car-a",
      startAt: "2026-06-11",
      endAt: "2026-06-14",
      status: "available" as const,
    };

    const res = checkSlotConflict(newSlot, existingSlots);
    expect(res.conflict).toBe(false);
  });

  it("should detect overlap when new slot starts inside an existing slot", () => {
    const newSlot = {
      carId: "car-a",
      startAt: "2026-06-05",
      endAt: "2026-06-12",
      status: "available" as const,
    };

    const res = checkSlotConflict(newSlot, existingSlots);
    expect(res.conflict).toBe(true);
    expect(res.conflictingSlot?.id).toBe("slot-1");
  });

  it("should detect overlap when new slot ends inside an existing slot", () => {
    const newSlot = {
      carId: "car-a",
      startAt: "2026-05-28",
      endAt: "2026-06-03",
      status: "available" as const,
    };

    const res = checkSlotConflict(newSlot, existingSlots);
    expect(res.conflict).toBe(true);
    expect(res.conflictingSlot?.id).toBe("slot-1");
  });

  it("should detect overlap when new slot completely encapsulates an existing slot", () => {
    const newSlot = {
      carId: "car-a",
      startAt: "2026-05-25",
      endAt: "2026-06-25",
      status: "available" as const,
    };

    const res = checkSlotConflict(newSlot, existingSlots);
    expect(res.conflict).toBe(true);
  });

  it("should allow overlapping dates for a different car", () => {
    const newSlot = {
      carId: "car-b",
      startAt: "2026-06-15",
      endAt: "2026-06-20",
      status: "available" as const,
    };

    const res = checkSlotConflict(newSlot, existingSlots);
    expect(res.conflict).toBe(false);
  });

  it("should throw error if start date is after end date", () => {
    const newSlot = {
      carId: "car-a",
      startAt: "2026-06-10",
      endAt: "2026-06-05",
      status: "available" as const,
    };

    expect(() => checkSlotConflict(newSlot, existingSlots)).toThrow("Başlangıç tarihi bitiş tarihinden önce olmalıdır.");
  });
});
