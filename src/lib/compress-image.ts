export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');

  // If user only typed 8 or 9 digits without DDD, assume Peruíbe DDD 13
  if (digits.length <= 9 && !digits.startsWith('13') && digits.length >= 8) {
    digits = `13${digits}`;
  }

  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export interface AdFormValidation {
  title?: string;
  description?: string;
  whatsapp?: string;
  category?: string;
  bairro?: string;
  pin?: string;
}

export function validateAdForm(form: {
  title?: string;
  description?: string;
  whatsapp?: string;
  category?: string;
  bairro?: string;
  pin?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!form.title || form.title.trim().length < 3) {
    errors.title = 'Título deve ter pelo menos 3 caracteres.';
  }

  if (!form.description || form.description.trim().length < 5) {
    errors.description = 'Descrição deve ter pelo menos 5 caracteres.';
  }

  const cleanPhone = (form.whatsapp || '').replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    errors.whatsapp = 'WhatsApp inválido (digite com DDD, ex: 13 9XXXX-XXXX).';
  }

  if (!form.category) {
    errors.category = 'Selecione uma categoria.';
  }

  if (!form.bairro) {
    errors.bairro = 'Selecione o bairro de Peruíbe.';
  }

  if (!form.pin || form.pin.trim().length < 4) {
    errors.pin = 'PIN deve ter pelo menos 4 dígitos para gerenciar o anúncio.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.75
): Promise<string> {
  if (typeof window === 'undefined') {
    return '';
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Falha ao processar imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
}
