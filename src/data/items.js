export const EQUIPMENT_SLOTS = [
    'head',
    'chest',
    'legs',
    'feet',
    'arms',
    'hands',
    'weapon'
];

export const ITEMS = [
    // Weapons
    {
        id: 'wep_basic_sword',
        name: 'Plasma Blade',
        type: 'equipment',
        slot: 'weapon',
        stats: { attack: 150, speed: 2 },
        rarity: 'common'
    },
    {
        id: 'wep_heavy_hammer',
        name: 'Gravity Hammer',
        type: 'equipment',
        slot: 'weapon',
        stats: { attack: 450, speed: -5 },
        rarity: 'rare'
    },

    // Head
    {
        id: 'head_visor',
        name: 'Tactical Visor',
        type: 'equipment',
        slot: 'head',
        stats: { defense: 40, attack: 20 },
        rarity: 'common'
    },

    // Chest
    {
        id: 'chest_plate',
        name: 'Nanofiber Vest',
        type: 'equipment',
        slot: 'chest',
        stats: { defense: 120, health: 300 },
        rarity: 'common'
    },

    // Legs
    {
        id: 'legs_greaves',
        name: 'Plated Greaves',
        type: 'equipment',
        slot: 'legs',
        stats: { defense: 80, speed: -2 },
        rarity: 'common'
    },

    // Feet
    {
        id: 'feet_boots',
        name: 'Rocket Boots',
        type: 'equipment',
        slot: 'feet',
        stats: { speed: 45 },
        rarity: 'rare'
    },

    // Arms
    {
        id: 'arms_guards',
        name: 'Energy Bracers',
        type: 'equipment',
        slot: 'arms',
        stats: { defense: 60 },
        rarity: 'common'
    },

    // Hands
    {
        id: 'hands_gloves',
        name: 'Grip Gloves',
        type: 'equipment',
        slot: 'hands',
        stats: { attack: 40, speed: 5 },
        rarity: 'common'
    }
];

export const SUBSTAT_POOL = [
    { stat: 'attack', min: 10, max: 40 },
    { stat: 'defense', min: 5, max: 20 },
    { stat: 'health', min: 50, max: 200 },
    { stat: 'speed', min: 1, max: 5 },
    { stat: 'critRate', min: 2, max: 8 },
    { stat: 'critDmg', min: 5, max: 20 },
    { stat: 'defPen', min: 2, max: 10 },
    { stat: 'regen', min: 10, max: 50 },
    { stat: 'evasion', min: 1, max: 5 },
    { stat: 'doubleHit', min: 1, max: 5 },
    { stat: 'counterRate', min: 2, max: 8 }
];

export const MATERIALS = [
    {
        id: 'mat_battle_record_1',
        name: 'Drill Battle Record',
        type: 'material',
        rarity: 'common',
        description: 'Basic combat data for operator training.'
    },
    {
        id: 'mat_battle_record_2',
        name: 'Frontline Battle Record',
        type: 'material',
        rarity: 'rare',
        description: 'Advanced tactical simulations for experienced operators.'
    },
    {
        id: 'mat_chip_sniper',
        name: 'Sniper Chip',
        type: 'material',
        rarity: 'rare',
        description: 'Promotion material for Sniper class operators.'
    },
    {
        id: 'mat_alloy',
        name: 'D32 Steel',
        type: 'material',
        rarity: 'epic',
        description: 'High-grade alloy used for elite equipment.'
    }
];
