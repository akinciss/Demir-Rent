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

    (rentalRepository.getActiveRentalsByCarId as any).mockResolvedValue(active);

    const res = await rentalService.checkDateAvailability('car1', '2026-06-12', '2026-06-13');
    expect(res.available).toBe(false);
  });

  it('allows non-overlapping rentals', async () => {
    (rentalRepository.getActiveRentalsByCarId as any).mockResolvedValue([
      { id: 'r1', startDate: '2026-06-10', endDate: '2026-06-15' }
    ]);

    const res = await rentalService.checkDateAvailability('car1', '2026-06-16', '2026-06-18');
    expect(res.available).toBe(true);
  });
});
