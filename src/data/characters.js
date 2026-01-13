import heidiImg from '../assets/characters/heidi.png';
import texasImg from '../assets/characters/texas.png';
import virtuosaImg from '../assets/characters/virtuosa.png';
import reedImg from '../assets/characters/reed.png';
import lemuenImg from '../assets/characters/lemuen.png';
import schwarzImg from '../assets/characters/schwarz.png';
import skadiImg from '../assets/characters/skadi.png';
import surtrImg from '../assets/characters/surtr.png';
import vulpisfogliaImg from '../assets/characters/vulpisfoglia.png';
import wImg from '../assets/characters/w.png';

// Configuration Flag
const ENABLE_TEST_CHARACTERS = false;

const ALL_CHARACTERS = [

  // TEST CHARACTERS
  {
    id: 'test_char_warrior',
    name: 'Astral Knight',
    description: 'A vanguard of the celestial fleet, wielding a blade of pure light.',
    stats: {
      attack: 15,
      defense: 25,
      health: 120,
      speed: 10
    },
    rarity: 1, // Base rarity (irrelevant if all start at 1 star white)
    element: 'Light',
    image: 'https://images.unsplash.com/photo-1636605553093-5183416c11d2?q=80&w=2070&auto=format&fit=crop' // Placeholder from unsplash
  },
  {
    id: 'test_char_mage',
    name: 'Void Weaver',
    description: 'Masters of the dark matter that binds the universe.',
    stats: {
      attack: 30,
      defense: 5,
      health: 80,
      speed: 15
    },
    rarity: 1,
    element: 'Dark',
    image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=2069&auto=format&fit=crop'
  },
  {
    id: 'test_char_rogue',
    name: 'Neon Strider',
    description: 'An agile infiltrator who moves unseen through the cyber-city.',
    stats: {
      attack: 25,
      defense: 10,
      health: 90,
      speed: 35
    },
    rarity: 1,
    element: 'Tech',
    image: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?q=80&w=2072&auto=format&fit=crop'
  },
  {
    id: 'test_char_tank',
    name: 'Titan Golem',
    description: 'A mechanical behemoth built to withstand supernovas.',
    stats: {
      attack: 10,
      defense: 40,
      health: 200,
      speed: 5
    },
    rarity: 1,
    element: 'Earth',
    image: 'https://images.unsplash.com/photo-1626294326577-c35064e43f49?q=80&w=1932&auto=format&fit=crop'
  },
  {
    id: 'test_char_healer',
    name: 'Star Mender',
    description: 'Harnesses the regenerative energy of nebulae.',
    stats: {
      attack: 5,
      defense: 15,
      health: 100,
      speed: 20
    },
    rarity: 1,
    element: 'Cosmic',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2022&auto=format&fit=crop'
  },

  // END TEST CHARACTERS

  {
    id: 'heidi',
    name: 'Heidi',
    description: 'Heidi is a powerful warrior who wields a sword of pure light.',
    stats: {
      attack: 15,
      defense: 25,
      health: 120,
      speed: 10
    },
    rarity: 1,
    element: 'Dark',
    image: heidiImg
  },
  {
    id: 'virtuosa',
    name: 'Virtuosa',
    description: 'Virtuosa is a powerful warrior who wields a sword of pure light.',
    stats: {
      attack: 20,
      defense: 25,
      health: 120,
      speed: 10
    },
    rarity: 1,
    element: 'Tech',
    image: virtuosaImg
  },
  {
    id: 'reed',
    name: 'Reed',
    description: 'Reed is a powerful warrior who wields a sword of pure light.',
    stats: {
      attack: 10,
      defense: 5,
      health: 100,
      speed: 20
    },
    rarity: 1,
    element: 'Light',
    image: reedImg
  },
  {
    id: 'texas',
    name: 'Texas',
    description: 'The Lone Star State',
    stats: {
      attack: 10,
      defense: 5,
      health: 100,
      speed: 20
    },
    rarity: 1,
    element: 'Tech',
    image: texasImg
  },
  {
    id: 'lemuen',
    name: 'Lemuen',
    description: 'A sharpshooter from Laterano.',
    stats: { attack: 25, defense: 10, health: 90, speed: 15 },
    rarity: 1,
    element: 'Light',
    image: lemuenImg
  },
  {
    id: 'schwarz',
    name: 'Schwarz',
    description: 'Elite bodyguard and assassin.',
    stats: { attack: 30, defense: 15, health: 110, speed: 12 },
    rarity: 1,
    element: 'Tech',
    image: schwarzImg
  },
  {
    id: 'skadi',
    name: 'Skadi',
    description: 'A powerful Abyssal Hunter.',
    stats: { attack: 35, defense: 20, health: 150, speed: 10 },
    rarity: 1,
    element: 'Cosmic', // Fitting for Abyssal?
    image: skadiImg
  },
  {
    id: 'surtr',
    name: 'Surtr',
    description: 'A mysterious Sarkaz with a fiery blade.',
    stats: { attack: 40, defense: 10, health: 100, speed: 15 },
    rarity: 1,
    element: 'Fire', // Or Dark
    image: surtrImg
  },
  {
    id: 'vulpisfoglia',
    name: 'Vulpis',
    description: 'A cunning operator.',
    stats: { attack: 15, defense: 15, health: 100, speed: 25 },
    rarity: 1,
    element: 'Earth',
    image: vulpisfogliaImg
  },
  {
    id: 'w',
    name: 'W',
    description: 'A volatile mercenary with a love for explosions.',
    stats: { attack: 28, defense: 12, health: 110, speed: 18 },
    rarity: 1,
    element: 'Fire',
    image: wImg
  }
];

export const CHARACTERS = ALL_CHARACTERS.filter(char => {
  if (ENABLE_TEST_CHARACTERS) return true;
  return !char.id.startsWith('test_char');
});

export const STAR_COLORS = {
  1: 'white',
  2: 'yellow',
  3: 'red',
  4: 'lightblue',
  5: 'rainbow'
};

export const MAX_STARS = 25;
