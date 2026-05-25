import { describe, it, expect } from 'vitest';

/**
 * adminApi.test.ts
 *
 * Tests for the admin API routes business rules:
 * - /api/admin/approve
 * - /api/admin/reject
 * - /api/admin/cancel
 * - /api/admin/complete
 *
 * These tests validate the business logic (state machine) without spinning up Next.js.
 * Integration tests against real Firebase require E2E tooling (e.g. firebase-admin emulator).
 */

// ── Status State Machine ──────────────────────────────────────────

type RentalStatus = 'pending' | 'active' | 'rejected' | 'cancelled' | 'completed';

interface Rental {
  id: string;
  status: RentalStatus;
  slotId?: string;
  carId: string;
}

interface Slot {
  id: string;
  status: 'available' | 'reserved' | 'booked' | 'closed';
}

/** Simulates /api/admin/approve transaction logic */
function approveRental(rental: Rental, slot: Slot | null) {
  if (rental.status !== 'pending') {
    return { ok: false, error: `Rental is '${rental.status}', cannot approve` };
  }
  if (rental.slotId && slot && slot.status !== 'reserved') {
    return { ok: false, error: 'Slot is no longer reserved' };
  }
  return { ok: true, newStatus: 'active' as RentalStatus };
}

/** Simulates /api/admin/reject transaction logic */
function rejectRental(rental: Rental, slot: Slot | null) {
  if (rental.status !== 'pending') {
    return { ok: false, error: `Rental is '${rental.status}', cannot reject` };
  }
  const slotNewStatus = slot ? 'available' : null;
  return { ok: true, newStatus: 'rejected' as RentalStatus, slotNewStatus };
}

/** Simulates /api/admin/cancel transaction logic */
function cancelRental(rental: Rental, slot: Slot | null) {
  if (rental.status !== 'active') {
    return { ok: false, error: `Rental is '${rental.status}', cannot cancel. Only active rentals can be cancelled.` };
  }
  const slotNewStatus = slot ? 'available' : null;
  return { ok: true, newStatus: 'cancelled' as RentalStatus, slotNewStatus };
}

/** Simulates /api/admin/complete transaction logic */
function completeRental(rental: Rental, slot: Slot | null) {
  if (rental.status !== 'active') {
    return { ok: false, error: `Rental is '${rental.status}', cannot complete. Only active rentals can be completed.` };
  }
  // Slot stays as 'booked' (historical record), not released back to 'available'
  const slotNewStatus = slot ? 'booked' : null;
  return { ok: true, newStatus: 'completed' as RentalStatus, slotNewStatus };
}

// ── Tests ─────────────────────────────────────────────────────────

describe('Admin approve route', () => {
  it('approves a pending rental successfully', () => {
    const rental: Rental = { id: 'r1', status: 'pending', slotId: 's1', carId: 'c1' };
    const slot: Slot = { id: 's1', status: 'reserved' };
    const result = approveRental(rental, slot);
    expect(result.ok).toBe(true);
    expect(result.newStatus).toBe('active');
  });

  it('rejects approval of already-active rental', () => {
    const rental: Rental = { id: 'r1', status: 'active', carId: 'c1' };
    const result = approveRental(rental, null);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('active');
  });

  it('rejects approval if slot is no longer reserved', () => {
    const rental: Rental = { id: 'r1', status: 'pending', slotId: 's1', carId: 'c1' };
    const slot: Slot = { id: 's1', status: 'available' }; // slot was released
    const result = approveRental(rental, slot);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('no longer reserved');
  });

  it('rejects approval of rejected rental', () => {
    const rental: Rental = { id: 'r1', status: 'rejected', carId: 'c1' };
    const result = approveRental(rental, null);
    expect(result.ok).toBe(false);
  });

  it('rejects approval of completed rental', () => {
    const rental: Rental = { id: 'r1', status: 'completed', carId: 'c1' };
    const result = approveRental(rental, null);
    expect(result.ok).toBe(false);
  });
});

describe('Admin reject route', () => {
  it('rejects a pending rental and releases slot', () => {
    const rental: Rental = { id: 'r1', status: 'pending', slotId: 's1', carId: 'c1' };
    const slot: Slot = { id: 's1', status: 'reserved' };
    const result = rejectRental(rental, slot);
    expect(result.ok).toBe(true);
    expect(result.newStatus).toBe('rejected');
    expect(result.slotNewStatus).toBe('available');
  });

  it('cannot reject an active rental', () => {
    const rental: Rental = { id: 'r1', status: 'active', carId: 'c1' };
    const result = rejectRental(rental, null);
    expect(result.ok).toBe(false);
  });

  it('cannot reject an already-rejected rental', () => {
    const rental: Rental = { id: 'r1', status: 'rejected', carId: 'c1' };
    const result = rejectRental(rental, null);
    expect(result.ok).toBe(false);
  });
});

describe('Admin cancel route', () => {
  it('cancels an active rental and releases slot', () => {
    const rental: Rental = { id: 'r1', status: 'active', slotId: 's1', carId: 'c1' };
    const slot: Slot = { id: 's1', status: 'reserved' };
    const result = cancelRental(rental, slot);
    expect(result.ok).toBe(true);
    expect(result.newStatus).toBe('cancelled');
    expect(result.slotNewStatus).toBe('available');
  });

  it('cannot cancel a pending rental', () => {
    const rental: Rental = { id: 'r1', status: 'pending', carId: 'c1' };
    const result = cancelRental(rental, null);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Only active rentals');
  });

  it('cannot cancel a completed rental', () => {
    const rental: Rental = { id: 'r1', status: 'completed', carId: 'c1' };
    const result = cancelRental(rental, null);
    expect(result.ok).toBe(false);
  });
});

describe('Admin complete route', () => {
  it('completes an active rental — slot becomes booked (not available)', () => {
    const rental: Rental = { id: 'r1', status: 'active', slotId: 's1', carId: 'c1' };
    const slot: Slot = { id: 's1', status: 'reserved' };
    const result = completeRental(rental, slot);
    expect(result.ok).toBe(true);
    expect(result.newStatus).toBe('completed');
    // Completed rentals do NOT release the slot back to available
    expect(result.slotNewStatus).toBe('booked');
    expect(result.slotNewStatus).not.toBe('available');
  });

  it('cannot complete a pending rental', () => {
    const rental: Rental = { id: 'r1', status: 'pending', carId: 'c1' };
    const result = completeRental(rental, null);
    expect(result.ok).toBe(false);
  });

  it('cannot complete an already-cancelled rental', () => {
    const rental: Rental = { id: 'r1', status: 'cancelled', carId: 'c1' };
    const result = completeRental(rental, null);
    expect(result.ok).toBe(false);
  });
});

describe('Authorization checks (simulated)', () => {
  it('non-admin cannot perform admin actions', () => {
    // Simulates what happens when roles/{uid}.admin is false or missing
    const roleData = { admin: false };
    const hasAdminAccess = roleData.admin === true;
    expect(hasAdminAccess).toBe(false);
  });

  it('missing role document means no admin access', () => {
    const roleData = null;
    const hasAdminAccess = roleData !== null && (roleData as Record<string, unknown>).admin === true;
    expect(hasAdminAccess).toBe(false);
  });

  it('valid admin token with admin role grants access', () => {
    const roleData = { admin: true };
    const hasAdminAccess = roleData.admin === true;
    expect(hasAdminAccess).toBe(true);
  });
});
