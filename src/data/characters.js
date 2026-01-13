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
import duskImg from '../assets/characters/dusk.jpg';
import exusiaiImg from '../assets/characters/exusiai.jpg';
import lapplandImg from '../assets/characters/lappland.jpg';
import nianImg from '../assets/characters/nian.png';

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
    id: 'char_dusk',
    name: 'Dusk',
    description: 'A painter who can bring her creations to life. Reclusive and mysterious.',
    stats: {
      attack: 90,
      defense: 20,
      health: 180,
      speed: 12
    },
    rarity: 6,
    class: 'Caster',
    image: duskImg,
    skills: {
      passive: {
        name: "Ink Spirit",
        description: "Summons a 'Freeling' to block enemies. (Simplified: +15% Defense)",
        type: "passive",
        effect: { type: "buff_stat_flat", stat: "defense", value: 15 }
      },
      skill1: {
        name: "Finishing Touch",
        description: "Deals 200% Arts damage to next attack.",
        type: "active",
        spCost: 4,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "damage_mult", value: 2.0, target: "enemy_single" }
      },
      skill2: {
        name: "Image of Daybreak",
        description: "Attack range expands and attacks all enemies for 3 turns. (Simplified: AoE Attack)",
        type: "active",
        spCost: 10,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "damage_mult", value: 1.5, target: "enemy_all" }
      }
    }
  },
  {
    id: 'char_exusiai',
    name: 'Exusiai',
    description: 'A cheerful Sancta skilled with firearms. Provides overwhelming covering fire.',
    stats: {
      attack: 75,
      defense: 20,
      health: 170,
      speed: 25
    },
    rarity: 6,
    class: 'Sniper',
    image: exusiaiImg,
    skills: {
      passive: {
        name: "Fast Cartridge",
        description: "Attack Speed +10.",
        type: "passive",
        effect: { type: "buff_stat_flat", stat: "speed", value: 10 }
      },
      skill1: {
        name: "Charging Mode",
        description: "Next attack hits 3 times.",
        type: "active",
        spCost: 3,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "multi_hit", count: 3, value: 1.0, target: "enemy_single" }
      },
      skill2: {
        name: "Overloading Mode",
        description: "Attacks hit 5 times with reduced damage for this turn.",
        type: "active",
        spCost: 5,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "multi_hit", count: 5, value: 0.9, target: "enemy_single" }
      }
    }
  },
  {
    id: 'char_lappland',
    name: 'Lappland',
    description: 'A dangerous Siracusan wolf with a dual-wielding style and a manic grin.',
    stats: {
      attack: 80,
      defense: 35,
      health: 230,
      speed: 16
    },
    rarity: 5,
    class: 'Guard',
    image: lapplandImg,
    skills: {
      passive: {
        name: "Spiritual Destruction",
        description: "Attacks disable enemy passive abilities. (Simplified: +10% Attack)",
        type: "passive",
        effect: { type: "buff_stat_flat", stat: "attack", value: 10 }
      },
      skill1: {
        name: "Sundial",
        description: "Attack +40% and 15% physical dodge.",
        type: "active",
        spCost: 0,
        cooldown: 4, // Usage: Cooldown based
        trigger: "auto",
        effect: { type: "buff_temp", stat: "attack", value: 0.4, duration: 1 }
      },
      skill2: {
        name: "Wolf Spirit",
        description: "Attacks turn into Arts damage and hit 2 targets.",
        type: "active",
        spCost: 6,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "buff_temp", stat: "attack", value: 0.8, duration: 1, targets: 2 }
      }
    }
  },
  {
    id: 'char_nian',
    name: 'Nian',
    description: 'An idle deity from Yan who enjoys metallurgy and spicy food. Extremely durable.',
    stats: {
      attack: 60,
      defense: 80,
      health: 400,
      speed: 10
    },
    rarity: 6,
    class: 'Defender',
    image: nianImg,
    skills: {
      passive: {
        name: "Metallurgy",
        description: "+20% Max HP.",
        type: "passive",
        effect: { type: "buff_stat_mult", stat: "health", value: 0.2 }
      },
      skill1: {
        name: "Tin Fire",
        description: "Defense +50%, deals Arts damage to attackers.",
        type: "active",
        spCost: 5,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "buff_temp", stat: "defense", value: 0.5, duration: 1 }
      },
      skill2: {
        name: "Copper Seal",
        description: "Stop attacking. Defense +80%, Resist +50%. Counter-attack everyone.",
        type: "active",
        spCost: 8,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "buff_temp", stat: "defense", value: 0.8, counter: 100, duration: 1 }
      }
    }
  },
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
    image: wImg,
    skills: {
      passive: {
        name: "Insult to Injury",
        description: "Deals 20% more damage to stunned enemies.",
        type: "passive",
        effect: { type: "buff_damage_cond", value: 20, condition: "status_stun" }
      },
      skill1: {
        name: "King of Hearts",
        description: "Next attack deals 250% damage.",
        type: "active",
        spCost: 4,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "damage_mult", value: 2.5, target: "enemy_single" }
      },
      skill2: {
        name: "D12",
        description: "Deals 300% AoE damage and Stuns enemies for 1 turn.",
        type: "active",
        spCost: 6,
        cooldown: 0,
        trigger: "auto",
        effect: { type: "damage_mult", value: 3.0, target: "enemy_all", status: "stun", duration: 1 }
      }
    }
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
export const MAX_LEVEL = 50;

export const BASE_STATS = {
  critRate: 5,      // 5%
  critDmg: 150,     // 150%
  defPen: 0,        // 0%
  regen: 0,         // Flat HP/turn
  evasion: 0,       // 0%
  doubleHit: 0,     // 0%
  counterRate: 0    // 0%
};
