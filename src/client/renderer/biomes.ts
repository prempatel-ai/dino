import { type PaletteTokens, interpolatePalette } from './palette';

export interface BiomeConfig {
  id: string;
  name: string;
  dayPalette: PaletteTokens;
  nightPalette: PaletteTokens;
  weatherType: 'sand' | 'fireflies' | 'rain' | 'snow' | 'embers' | 'grid' | 'cosmic';
}

export const BIOMES: BiomeConfig[] = [
  {
    id: 'desert',
    name: 'Classic Desert',
    weatherType: 'sand',
    dayPalette: {
      skyTop: '#F7F7F2',
      skyBottom: '#E9EEF2',
      dinoBody: '#535353',
      dinoShade: '#3E3E3E',
      cactus: '#4F6F52',
      ground: '#535353',
      farDunes: '#E3DCCB',
      midDunes: '#D2C8AE',
      accent: '#FFB020',
    },
    nightPalette: {
      skyTop: '#14161F',
      skyBottom: '#1F2433',
      dinoBody: '#E8E8E8',
      dinoShade: '#BDBDBD',
      cactus: '#9FBFA2',
      ground: '#CFCFCF',
      farDunes: '#1B1F2C',
      midDunes: '#252B3B',
      accent: '#FFB020',
    },
  },
  {
    id: 'canyon',
    name: 'Canyon Sunset',
    weatherType: 'fireflies',
    dayPalette: {
      skyTop: '#FFD9A8',
      skyBottom: '#FFAE73',
      dinoBody: '#3F2822',
      dinoShade: '#2B1A16',
      cactus: '#E88B5A',
      ground: '#5A3A32',
      farDunes: '#E88B5A',
      midDunes: '#C55A3C',
      accent: '#FF6B35',
    },
    nightPalette: {
      skyTop: '#2A1B3D',
      skyBottom: '#3B2550',
      dinoBody: '#E0CCD8',
      dinoShade: '#BCA4B3',
      cactus: '#C55A3C',
      ground: '#D8B8C8',
      farDunes: '#3B2550',
      midDunes: '#4A2E5E',
      accent: '#FF6B35',
    },
  },
  {
    id: 'oasis',
    name: 'Oasis Sanctuary',
    weatherType: 'rain',
    dayPalette: {
      skyTop: '#DFF3EA',
      skyBottom: '#C1EAD8',
      dinoBody: '#374E45',
      dinoShade: '#23372F',
      cactus: '#2EC4B6',
      ground: '#4A5A4F',
      farDunes: '#A8D5BA',
      midDunes: '#6FB38A',
      accent: '#2EC4B6',
    },
    nightPalette: {
      skyTop: '#0E2A2F',
      skyBottom: '#14383C',
      dinoBody: '#D0EFE5',
      dinoShade: '#A3D9C9',
      cactus: '#6FB38A',
      ground: '#BFE3D2',
      farDunes: '#14383C',
      midDunes: '#1B4A4A',
      accent: '#2EC4B6',
    },
  },
  {
    id: 'tundra',
    name: 'Frozen Tundra',
    weatherType: 'snow',
    dayPalette: {
      skyTop: '#E8F4FF',
      skyBottom: '#D0E8FC',
      dinoBody: '#38485B',
      dinoShade: '#243242',
      cactus: '#7DF9FF',
      ground: '#55677A',
      farDunes: '#C9E3F5',
      midDunes: '#A4CBE6',
      accent: '#7DF9FF',
    },
    nightPalette: {
      skyTop: '#0B1330',
      skyBottom: '#12204A',
      dinoBody: '#E3EFFF',
      dinoShade: '#BFD7F5',
      cactus: '#A4CBE6',
      ground: '#DDEBFA',
      farDunes: '#12204A',
      midDunes: '#1B3563',
      accent: '#7DF9FF',
    },
  },
  {
    id: 'volcanic',
    name: 'Volcanic Badlands',
    weatherType: 'embers',
    dayPalette: {
      skyTop: '#8C7B75',
      skyBottom: '#71605A',
      dinoBody: '#2B2322',
      dinoShade: '#1C1514',
      cactus: '#FF4500',
      ground: '#2B2322',
      farDunes: '#5A4A47',
      midDunes: '#3D302E',
      accent: '#FF4500',
    },
    nightPalette: {
      skyTop: '#1A0F10',
      skyBottom: '#2A1514',
      dinoBody: '#F0D4C8',
      dinoShade: '#CDB1A5',
      cactus: '#FF6347',
      ground: '#E0B8A8',
      farDunes: '#2A1514',
      midDunes: '#3A1C19',
      accent: '#FF4500',
    },
  },
  {
    id: 'neon',
    name: 'Neon Future',
    weatherType: 'grid',
    dayPalette: {
      skyTop: '#1B1033',
      skyBottom: '#28174D',
      dinoBody: '#00F0FF',
      dinoShade: '#00B8C4',
      cactus: '#FF2E97',
      ground: '#2A1B4D',
      farDunes: '#3A1B6E',
      midDunes: '#5B2A9B',
      accent: '#FF2E97',
    },
    nightPalette: {
      skyTop: '#07040F',
      skyBottom: '#100624',
      dinoBody: '#00F0FF',
      dinoShade: '#00A6B2',
      cactus: '#FF2E97',
      ground: '#00F0FF',
      farDunes: '#120A2A',
      midDunes: '#1E0F45',
      accent: '#FF2E97',
    },
  },
  {
    id: 'space',
    name: 'Space Dunes',
    weatherType: 'cosmic',
    dayPalette: {
      skyTop: '#0B0F2A',
      skyBottom: '#151C47',
      dinoBody: '#D7DAF0',
      dinoShade: '#B3B8DC',
      cactus: '#B388FF',
      ground: '#8A8FB0',
      farDunes: '#1C2350',
      midDunes: '#2E3A7A',
      accent: '#B388FF',
    },
    nightPalette: {
      skyTop: '#04050F',
      skyBottom: '#080A1F',
      dinoBody: '#EBEBFF',
      dinoShade: '#C2C2EB',
      cactus: '#B388FF',
      ground: '#D7DAF0',
      farDunes: '#0A0D26',
      midDunes: '#12173A',
      accent: '#B388FF',
    },
  },
];

export class BiomeManager {
  currentBiomeIndex: number = 0;
  targetBiomeIndex: number = 0;
  transitionProgress: number = 1; // 1 = complete, < 1 = in transition
  private readonly transitionDurationMs = 3000;

  get currentBiome(): BiomeConfig {
    return BIOMES[this.currentBiomeIndex % BIOMES.length];
  }

  get targetBiome(): BiomeConfig {
    return BIOMES[this.targetBiomeIndex % BIOMES.length];
  }

  update(newBiomeIndex: number, msElapsed: number): { transitioned: boolean } {
    let transitioned = false;

    if (newBiomeIndex !== this.targetBiomeIndex) {
      this.currentBiomeIndex = this.targetBiomeIndex;
      this.targetBiomeIndex = newBiomeIndex;
      this.transitionProgress = 0;
      transitioned = true;
    }

    if (this.transitionProgress < 1) {
      this.transitionProgress = Math.min(1, this.transitionProgress + msElapsed / this.transitionDurationMs);
      if (this.transitionProgress >= 1) {
        this.currentBiomeIndex = this.targetBiomeIndex;
      }
    }

    return { transitioned };
  }

  getPalette(_isNight: boolean, nightFade: number): PaletteTokens {
    const curConfig = this.currentBiome;
    const tgtConfig = this.targetBiome;

    const curPal = interpolatePalette(curConfig.dayPalette, curConfig.nightPalette, nightFade);
    if (this.transitionProgress >= 1) {
      return curPal;
    }

    const tgtPal = interpolatePalette(tgtConfig.dayPalette, tgtConfig.nightPalette, nightFade);
    return interpolatePalette(curPal, tgtPal, this.transitionProgress);
  }
}
