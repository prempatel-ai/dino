export interface PaletteTokens {
  skyTop: string;
  skyBottom: string;
  dinoBody: string;
  dinoShade: string;
  cactus: string;
  ground: string;
  farDunes: string;
  midDunes: string;
  accent: string;
}

export const DAY_PALETTE: PaletteTokens = {
  skyTop: '#F7F7F2',
  skyBottom: '#E9EEF2',
  dinoBody: '#535353',
  dinoShade: '#3E3E3E',
  cactus: '#4F6F52',
  ground: '#535353',
  farDunes: '#E3DCCB',
  midDunes: '#D2C8AE',
  accent: '#FFB020',
};

export const NIGHT_PALETTE: PaletteTokens = {
  skyTop: '#14161F',
  skyBottom: '#1F2433',
  dinoBody: '#E8E8E8',
  dinoShade: '#BDBDBD',
  cactus: '#9FBFA2',
  ground: '#CFCFCF',
  farDunes: '#1B1F2C',
  midDunes: '#252B3B',
  accent: '#FFB020',
};

export const RETRO_DAY_PALETTE: PaletteTokens = {
  skyTop: '#FFFFFF',
  skyBottom: '#FFFFFF',
  dinoBody: '#535353',
  dinoShade: '#535353',
  cactus: '#535353',
  ground: '#535353',
  farDunes: '#FFFFFF',
  midDunes: '#FFFFFF',
  accent: '#535353',
};

export const RETRO_NIGHT_PALETTE: PaletteTokens = {
  skyTop: '#000000',
  skyBottom: '#000000',
  dinoBody: '#FFFFFF',
  dinoShade: '#FFFFFF',
  cactus: '#FFFFFF',
  ground: '#FFFFFF',
  farDunes: '#000000',
  midDunes: '#000000',
  accent: '#FFFFFF',
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export function lerpColor(c1: string, c2: string, t: number): string {
  const tClamped = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = r1 + (r2 - r1) * tClamped;
  const g = g1 + (g2 - g1) * tClamped;
  const b = b1 + (b2 - b1) * tClamped;
  return rgbToHex(r, g, b);
}

export function interpolatePalette(p1: PaletteTokens, p2: PaletteTokens, t: number): PaletteTokens {
  return {
    skyTop: lerpColor(p1.skyTop, p2.skyTop, t),
    skyBottom: lerpColor(p1.skyBottom, p2.skyBottom, t),
    dinoBody: lerpColor(p1.dinoBody, p2.dinoBody, t),
    dinoShade: lerpColor(p1.dinoShade, p2.dinoShade, t),
    cactus: lerpColor(p1.cactus, p2.cactus, t),
    ground: lerpColor(p1.ground, p2.ground, t),
    farDunes: lerpColor(p1.farDunes, p2.farDunes, t),
    midDunes: lerpColor(p1.midDunes, p2.midDunes, t),
    accent: lerpColor(p1.accent, p2.accent, t),
  };
}
