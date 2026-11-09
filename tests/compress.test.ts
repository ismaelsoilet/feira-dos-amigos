import { describe, it, expect } from 'vitest';
import { formatPhoneInput, validateAdForm } from '../src/lib/compress-image';

describe('Task 6: Ad Creation & Image Helpers', () => {
  it('should format WhatsApp input with (13) mask automatically', () => {
    expect(formatPhoneInput('13997123456')).toBe('(13) 99712-3456');
    expect(formatPhoneInput('1334551234')).toBe('(13) 3455-1234');
    expect(formatPhoneInput('997123456')).toBe('(13) 99712-3456'); // Auto-prepends 13 if missing
  });

  it('should validate required fields and reject invalid data', () => {
    const invalid = validateAdForm({
      title: 'A',
      description: 'curt',
      whatsapp: '123',
      category: '',
      bairro: '',
      pin: '12',
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.title).toBeDefined();
    expect(invalid.errors.whatsapp).toBeDefined();
    expect(invalid.errors.pin).toBeDefined();

    const valid = validateAdForm({
      title: 'Bicicleta Infantil Aro 16',
      description: 'Bicicleta rosa em ótimo estado no Centro.',
      whatsapp: '13997123456',
      category: 'veiculos',
      bairro: 'Centro',
      pin: '1234',
    });
    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);
  });
});
