import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Task 1: Project Setup & Branding Verification', () => {
  it('should have the official logo image copied to public/logo.jpg', () => {
    const logoPath = path.resolve(__dirname, '../public/logo.jpg');
    expect(fs.existsSync(logoPath)).toBe(true);
    const stats = fs.statSync(logoPath);
    expect(stats.size).toBeGreaterThan(1000);
  });

  it('should configure the cosmic purple and neon green palette in CSS or Tailwind', () => {
    const cssPath = path.resolve(__dirname, '../src/app/globals.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    // Spec requires neon green and cosmic purple variables/classes
    expect(cssContent).toMatch(/neon|lime|purple|violet|#0f071b|#22c55e|#39FF14/i);
  });
});
