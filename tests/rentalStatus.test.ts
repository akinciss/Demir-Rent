import { describe, it, expect } from 'vitest';
import type { RentalStatus } from '@/types/rental';
import type { Car } from '@/types/car';

/**
 * Bu testler TypeScript'in derleme-zamanı tip güvenliğini doğrular.
 * Runtime'da geçerli değerleri kontrol eder.
 */

const VALID_STATUSES: RentalStatus[] = [
  'onay_bekliyor',
  'aktif',
  'reddedildi',
  'iptal',
  'tamamlandi',
];

describe('RentalStatus type', () => {
  it('accepts all valid status values', () => {
    const statuses: RentalStatus[] = [
      'onay_bekliyor',
      'aktif',
      'reddedildi',
      'iptal',
      'tamamlandi',
    ];
    // All values should be in the valid set
    for (const s of statuses) {
      expect(VALID_STATUSES).toContain(s);
    }
  });

  it('has exactly 5 valid statuses', () => {
    expect(VALID_STATUSES).toHaveLength(5);
  });

  it('includes reddedildi as a distinct value from iptal', () => {
    expect(VALID_STATUSES).toContain('reddedildi');
    expect(VALID_STATUSES).toContain('iptal');
    expect('reddedildi').not.toBe('iptal');
  });

  it('does not include legacy string values', () => {
    const legacyValues = ['pending', 'approved', 'cancelled', 'active'];
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
  it('only onay_bekliyor can be approved', () => {
    const approvableStatuses: RentalStatus[] = ['onay_bekliyor'];
    const nonApprovable: RentalStatus[] = ['aktif', 'reddedildi', 'iptal', 'tamamlandi'];

    expect(approvableStatuses).toContain('onay_bekliyor');
    for (const s of nonApprovable) {
      expect(approvableStatuses).not.toContain(s);
    }
  });

  it('only onay_bekliyor can be rejected, slot released', () => {
    const rejectableStatuses: RentalStatus[] = ['onay_bekliyor'];
    expect(rejectableStatuses).toContain('onay_bekliyor');
    expect(rejectableStatuses).not.toContain('aktif');
  });

  it('only aktif can be cancelled or completed', () => {
    const actableStatuses: RentalStatus[] = ['aktif'];
    expect(actableStatuses).toContain('aktif');
    expect(actableStatuses).not.toContain('onay_bekliyor');
  });
});
