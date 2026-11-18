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
      skyTop: '#0F172A',
      skyBottom: '#1E293B',
      dinoBody: '#F8FAFC',
      dinoShade: '#CBD5E1',
      cactus: '#34D399',
      ground: '#334155',
      farDunes: '#162033',
      midDunes: '#1E293B',
      accent: '#38BDF8',
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
      skyTop: '#1E132D',
      skyBottom: '#2C1A40',
      dinoBody: '#F5EEF8',
      dinoShade: '#D8BFD8',
      cactus: '#E07A5F',
      ground: '#3B284A',
      farDunes: '#261536',
      midDunes: '#1C0F28',
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
      skyTop: '#051E22',
      skyBottom: '#0B2D33',
      dinoBody: '#E6FFFA',
      dinoShade: '#A7F3D0',
      cactus: '#2DD4BF',
      ground: '#134E4A',
      farDunes: '#08282E',
      midDunes: '#0E3840',
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
      skyTop: '#0A1128',
      skyBottom: '#132247',
      dinoBody: '#F0F9FF',
      dinoShade: '#BAE6FD',
      cactus: '#38BDF8',
      ground: '#1E293B',
      farDunes: '#0E1736',
      midDunes: '#16254F',
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
      skyTop: '#180A0C',
      skyBottom: '#261014',
      dinoBody: '#FFE4E6',
      dinoShade: '#FECDD3',
      cactus: '#FB7185',
      ground: '#2E1217',
      farDunes: '#1F0B0E',
      midDunes: '#2A1014',
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
      skyTop: '#080414',
      skyBottom: '#12072B',
      dinoBody: '#00F0FF',
      dinoShade: '#00B8C4',
      cactus: '#FF2E97',
      ground: '#2A1352',
      farDunes: '#15082E',
      midDunes: '#1E0A40',
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
      dinoBody: '#D8B4FE',
      dinoShade: '#A855F7',
      cactus: '#C084FC',
      ground: '#151C47',
      farDunes: '#1E255E',
      midDunes: '#2C3582',
      accent: '#B388FF',
    },
    nightPalette: {
      skyTop: '#05081A',
      skyBottom: '#0D1438',
      dinoBody: '#F3E8FF',
      dinoShade: '#D8B4FE',
      cactus: '#A855F7',
      ground: '#23184A',
      farDunes: '#090D2A',
      midDunes: '#121740',
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
