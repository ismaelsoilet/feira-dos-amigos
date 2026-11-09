import { describe, it, expect } from 'vitest';
import { formatPhoneInput, validateAdForm, isValidPin } from '../src/lib/compress-image';

describe('Task 6: Ad Creation & Image Helpers', () => {
  it('should format WhatsApp input with (13) mask automatically for 8 or 9 digits', () => {
    expect(formatPhoneInput('13997123456')).toBe('(13) 99712-3456');
    expect(formatPhoneInput('1334551234')).toBe('(13) 3455-1234');
    expect(formatPhoneInput('997123456')).toBe('(13) 99712-3456'); // Auto-prepends 13 if missing
  });

  it('should format short numbers gracefully as user types', () => {
    expect(formatPhoneInput('')).toBe('');
    expect(formatPhoneInput('1')).toBe('(1');
    expect(formatPhoneInput('13')).toBe('(13');
  });

  it('should reject invalid form data when required fields are missing', () => {
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
    expect(invalid.errors.description).toBeDefined();
    expect(invalid.errors.whatsapp).toBeDefined();
    expect(invalid.errors.category).toBeDefined();
    expect(invalid.errors.bairro).toBeDefined();
    expect(invalid.errors.pin).toBeDefined();
  });

  it('should accept valid form data with 6-character alphanumeric PIN', () => {
    const valid = validateAdForm({
      title: 'Bicicleta Infantil Aro 16',
      description: 'Bicicleta rosa em ótimo estado no Centro.',
      whatsapp: '13997123456',
      category: 'veiculos',
      bairro: 'Centro',
      pin: 'ABC123',
    });
    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);
  });

  it('should reject PINs that are not exactly 6 alphanumeric characters', () => {
    // Empty or falsy PINs
    expect(isValidPin('')).toBe(false);
    expect(isValidPin('      ')).toBe(false);
    expect(validateAdForm({ title: 'Item', description: 'Descricao longa', whatsapp: '13997123456', category: 'outros', bairro: 'Centro', pin: '' }).isValid).toBe(false);
    // 4 digits (old format)
    expect(validateAdForm({ title: 'Item', description: 'Descricao longa', whatsapp: '13997123456', category: 'outros', bairro: 'Centro', pin: '1234' }).isValid).toBe(false);
    // 5 chars
    expect(validateAdForm({ title: 'Item', description: 'Descricao longa', whatsapp: '13997123456', category: 'outros', bairro: 'Centro', pin: 'ABC12' }).isValid).toBe(false);
    // 7 chars
    expect(validateAdForm({ title: 'Item', description: 'Descricao longa', whatsapp: '13997123456', category: 'outros', bairro: 'Centro', pin: 'ABC1234' }).isValid).toBe(false);
    // Special symbols
    expect(validateAdForm({ title: 'Item', description: 'Descricao longa', whatsapp: '13997123456', category: 'outros', bairro: 'Centro', pin: 'AB@123' }).isValid).toBe(false);
    // 6 letters only -> valid
    expect(validateAdForm({ title: 'Item', description: 'Descricao longa', whatsapp: '13997123456', category: 'outros', bairro: 'Centro', pin: 'ABCDEF' }).isValid).toBe(true);
    // 6 digits only -> valid
    expect(validateAdForm({ title: 'Item', description: 'Descricao longa', whatsapp: '13997123456', category: 'outros', bairro: 'Centro', pin: '123456' }).isValid).toBe(true);
    expect(isValidPin('ABC123')).toBe(true);
  });
});
