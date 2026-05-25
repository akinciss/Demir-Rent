import { describe, it, expect, vi } from 'vitest';
import { rentalService } from '@/services/rentalService';
import { rentalRepository } from '@/repositories/rentalRepository';

vi.mock('@/repositories/rentalRepository');

describe('rentalService.checkDateAvailability', () => {
  it('rejects overlapping rentals', async () => {
    // existing active rental: 2026-06-10 to 2026-06-15
    const active = [
      { id: 'r1', startDate: '2026-06-10', endDate: '2026-06-15' }
    ];

    (rentalRepository.getActiveRentalsByCarId as ReturnType<typeof vi.fn>).mockResolvedValue(active);

    const res = await rentalService.checkDateAvailability('car1', '2026-06-12', '2026-06-13');
    expect(res.available).toBe(false);
  });

  it('allows non-overlapping rentals', async () => {
    (rentalRepository.getActiveRentalsByCarId as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'r1', startDate: '2026-06-10', endDate: '2026-06-15' }
    ]);

    const res = await rentalService.checkDateAvailability('car1', '2026-06-16', '2026-06-18');
    expect(res.available).toBe(true);
  });

  it('rejects adjacent (touching) rentals', async () => {
    (rentalRepository.getActiveRentalsByCarId as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'r1', startDate: '2026-06-10', endDate: '2026-06-15' }
    ]);

    // Ends exactly when existing starts — should overlap
    const res = await rentalService.checkDateAvailability('car1', '2026-06-05', '2026-06-10');
    expect(res.available).toBe(false);
  });
});

describe('rentalService.calculateDynamicPrice', () => {
  it('calculates base price for weekdays only', () => {
    // 2026-06-15 (Mon) to 2026-06-17 (Wed) — 2 weekdays
    const result = rentalService.calculateDynamicPrice(100, '2026-06-15', '2026-06-17');
    expect(result.totalDays).toBe(2);
    expect(result.weekendDays).toBe(0);
    expect(result.hasWeekendSurcharge).toBe(false);
    expect(result.totalPrice).toBe(200);
  });

  it('applies 1.25x weekend surcharge', () => {
    // 2026-06-20 (Sat) to 2026-06-22 (Mon) — 1 Sat + 1 Sun
    const result = rentalService.calculateDynamicPrice(100, '2026-06-20', '2026-06-22');
    expect(result.weekendDays).toBe(2);
    expect(result.hasWeekendSurcharge).toBe(true);
    // 2 days × 100 × 1.25 = 250
    expect(result.totalPrice).toBe(250);
  });

  it('returns minimum 1 day when start equals end', () => {
    const result = rentalService.calculateDynamicPrice(100, '2026-06-15', '2026-06-15');
    expect(result.totalDays).toBe(1);
  });
});
