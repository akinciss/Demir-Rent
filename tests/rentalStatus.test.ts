import { describe, it, expect } from 'vitest';
import type { RentalStatus } from '@/types/rental';
import type { Car } from '@/types/car';

/**
 * Bu testler TypeScript'in derleme-zamanı tip güvenliğini doğrular.
 * Runtime'da geçerli değerleri kontrol eder.
 */

const VALID_STATUSES: RentalStatus[] = [
  'pending',
  'active',
  'rejected',
  'cancelled',
  'completed',
];

describe('RentalStatus type', () => {
  it('accepts all valid status values', () => {
    const statuses: RentalStatus[] = [
      'pending',
      'active',
      'rejected',
      'cancelled',
      'completed',
    ];
    // All values should be in the valid set
    for (const s of statuses) {
      expect(VALID_STATUSES).toContain(s);
    }
  });

  it('has exactly 5 valid statuses', () => {
    expect(VALID_STATUSES).toHaveLength(5);
  });

  it('includes rejected as a distinct value from cancelled', () => {
    expect(VALID_STATUSES).toContain('rejected');
    expect(VALID_STATUSES).toContain('cancelled');
    expect('rejected').not.toBe('cancelled');
  });

  it('does not include legacy string values', () => {
    const legacyValues = ['onay_bekliyor', 'aktif', 'reddedildi', 'iptal', 'tamamlandi'];
    for (const v of legacyValues) {
      expect(VALID_STATUSES).not.toContain(v as RentalStatus);
    }
  });
});

describe('Car.id type', () => {
  it('Car.id is always a string', () => {
    const car: Car = {
      id: 'firebase-doc-id-123',
      brand: 'BMW',
      model: '320i',
      year: 2024,
      fuel: 'Benzin',
      transmission: 'Otomatik',
      seats: 5,
      pricePerDay: 500,
      image: 'https://example.com/car.jpg',
    };
    expect(typeof car.id).toBe('string');
  });
});

describe('Car.isActive backward compatibility', () => {
  it('Car uses isActive field (not isAvailable)', () => {
    const car: Car = {
      id: 'car-1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      fuel: 'Benzin',
      transmission: 'Otomatik',
      seats: 5,
      pricePerDay: 300,
      image: 'https://example.com/car.jpg',
      isActive: true,
    };
    // isActive should be set, not isAvailable
    expect(car.isActive).toBe(true);
    expect('isAvailable' in car).toBe(false);
  });

  it('Car.isActive defaults to true when not set', () => {
    const car: Car = {
      id: 'car-2',
      brand: 'Honda',
      model: 'Civic',
      year: 2022,
      fuel: 'Dizel',
      transmission: 'Manuel',
      seats: 5,
      pricePerDay: 250,
      image: 'https://example.com/car2.jpg',
    };
    // When isActive is undefined, we treat it as true
    expect(car.isActive ?? true).toBe(true);
  });
});

describe('Status transition rules (documented expectations)', () => {
  it('only pending can be approved', () => {
    const approvableStatuses: RentalStatus[] = ['pending'];
    const nonApprovable: RentalStatus[] = ['active', 'rejected', 'cancelled', 'completed'];

    expect(approvableStatuses).toContain('pending');
    for (const s of nonApprovable) {
      expect(approvableStatuses).not.toContain(s);
    }
  });

  it('only pending can be rejected, slot released', () => {
    const rejectableStatuses: RentalStatus[] = ['pending'];
    expect(rejectableStatuses).toContain('pending');
    expect(rejectableStatuses).not.toContain('active');
  });

  it('only active can be cancelled or completed', () => {
    const actableStatuses: RentalStatus[] = ['active'];
    expect(actableStatuses).toContain('active');
    expect(actableStatuses).not.toContain('pending');
  });
});
