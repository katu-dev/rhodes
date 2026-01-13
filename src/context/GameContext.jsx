import { createContext, useContext, useReducer, useEffect } from 'react';
import { CHARACTERS, MAX_STARS, MAX_LEVEL, BASE_STATS } from '../data/characters';
import { ITEMS, MATERIALS, SUBSTAT_POOL } from '../data/items';
import { ENEMIES } from '../data/enemies';

const GameContext = createContext();

const INITIAL_STATE = {
    currency: 1000,
    headhuntTickets: 5,
    inventory: [],
    items: [],
    arenaRoster: [],
    lastTick: Date.now(),
    lab: {
        level: 1,
        lastClaimTime: Date.now(),
        slots: [null, null, null, null, null]
    },
};

const calculateStats = (char) => {
    const { attack, defense, health, speed } = char.stats;

    // Star Multiplier (10% per star above 1)
    const starMult = 1 + ((char.stars || 1) - 1) * 0.1;

    // Apply Star Multiplier to Base Stats
    const baseAtk = Math.floor(attack * starMult);
    const baseDef = Math.floor(defense * starMult);
    const baseHp = Math.floor(health * starMult);
    const baseSpd = Math.floor(speed * starMult);

    // Add equipment stats
    let bonusStats = {
        attack: 0, defense: 0, health: 0, speed: 0,
        critRate: 0, critDmg: 0, defPen: 0, regen: 0,
        evasion: 0, doubleHit: 0, counterRate: 0
    };

    if (char.equipment) {
        Object.values(char.equipment).forEach(item => {
            if (item) {
                // Item Level Multiplier: +10% per level
                const itemLevel = item.level || 0;
                const itemMult = 1 + (itemLevel * 0.1);

                if (item.stats.attack) bonusStats.attack += Math.floor(item.stats.attack * itemMult);
                if (item.stats.defense) bonusStats.defense += Math.floor(item.stats.defense * itemMult);
                if (item.stats.health) bonusStats.health += Math.floor(item.stats.health * itemMult);
                if (item.stats.speed) bonusStats.speed += Math.floor(item.stats.speed * itemMult);
                // Base item stats don't usually have advanced stats yet, but if they did:
                if (item.stats.critRate) bonusStats.critRate += Math.floor(item.stats.critRate * itemMult);
                // ... etc. assuming items.js main stats don't have them yet.

                // Add Substats
                if (item.substats) {
                    item.substats.forEach(sub => {
                        if (bonusStats[sub.stat] !== undefined) {
                            bonusStats[sub.stat] += sub.value;
                        }
                    });
                }
            }
        });
    }

    return {
        attack: baseAtk + bonusStats.attack,
        defense: baseDef + bonusStats.defense,
        health: baseHp + bonusStats.health,
        speed: baseSpd + bonusStats.speed,
        critRate: (BASE_STATS.critRate || 5) + bonusStats.critRate,
        critDmg: (BASE_STATS.critDmg || 150) + bonusStats.critDmg,
        defPen: (BASE_STATS.defPen || 0) + bonusStats.defPen,
        regen: (BASE_STATS.regen || 0) + bonusStats.regen,
        evasion: (BASE_STATS.evasion || 0) + bonusStats.evasion,
        doubleHit: (BASE_STATS.doubleHit || 0) + bonusStats.doubleHit,
        counterRate: (BASE_STATS.counterRate || 0) + bonusStats.counterRate
    };
};

const calculatePower = (char) => {
    const stats = calculateStats(char);
    return Math.floor(stats.attack * 2 + stats.defense * 1.5 + stats.health * 0.5 + stats.speed * 2);
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_CURRENCY':
            return { ...state, currency: state.currency + action.payload };

        case 'SPEND_CURRENCY':
            if (state.currency < action.payload) return state;
            return { ...state, currency: state.currency - action.payload };

        case 'ROLL_CHARACTER': {
            const { baseId, cost } = action.payload;
            const existingCharIndex = state.inventory.findIndex(c => c.baseId === baseId);
            let newInventory = [...state.inventory];
            let refundCurrency = 0;

            if (existingCharIndex !== -1) {
                // Upgrade Logic
                const char = newInventory[existingCharIndex];
                if (char.stars < MAX_STARS) {
                    const newStars = char.stars + 1;
                    newInventory[existingCharIndex] = { ...char, stars: newStars };
                } else {
                    const costPerPull = cost; // Simplify single pull refund
                    refundCurrency += (costPerPull / 2);
                }
            } else {
                // New Character
                const baseChar = CHARACTERS.find(c => c.id === baseId);
                newInventory.push({
                    uid: Date.now().toString() + Math.random(),
                    baseId: baseId,
                    stars: 1,
                    level: 1,
                    stats: { ...baseChar.stats },
                    equipment: { head: null, chest: null, legs: null, feet: null, arms: null, hands: null, weapon: null }
                });
            }

            return {
                ...state,
                headhuntTickets: state.headhuntTickets - cost,
                currency: state.currency + refundCurrency,
                inventory: newInventory
            };
        }

        case 'LEVEL_UP': {
            const { charId } = action.payload;
            const charIndex = state.inventory.findIndex(c => c.uid === charId);
            if (charIndex === -1) return state;

            const char = state.inventory[charIndex];
            const currentLevel = char.level || 1;

            if (currentLevel >= MAX_LEVEL) return state;

            const goldCost = currentLevel * 100;
            const isBreakthrough = (currentLevel % 10) === 9;
            let matCost = null;

            if (isBreakthrough) {
                matCost = { id: 'mat_battle_record_1', count: Math.ceil(currentLevel / 10) };
            }

            if (state.currency < goldCost) return state;

            let newItems = [...state.items];

            if (matCost) {
                const matIndex = newItems.findIndex(i => i.id === matCost.id);
                if (matIndex === -1 || newItems[matIndex].count < matCost.count) return state;
                newItems[matIndex] = { ...newItems[matIndex], count: newItems[matIndex].count - matCost.count };
                if (newItems[matIndex].count <= 0) newItems.splice(matIndex, 1);
            }

            const growthMultiplier = 1.05;
            const newStats = {
                attack: Math.floor(char.stats.attack * growthMultiplier),
                defense: Math.floor(char.stats.defense * growthMultiplier),
                health: Math.floor(char.stats.health * growthMultiplier),
                speed: Math.floor(char.stats.speed * growthMultiplier),
            };

            const newInventory = [...state.inventory];
            newInventory[charIndex] = { ...char, level: currentLevel + 1, stats: newStats };

            return { ...state, currency: state.currency - goldCost, items: newItems, inventory: newInventory };
        }

        case 'ROLL_BATCH': {
            const { baseIds, cost } = action.payload;
            let newInventory = [...state.inventory];
            let refundCurrency = 0;

            baseIds.forEach(baseId => {
                const existingCharIndex = newInventory.findIndex(c => c.baseId === baseId);
                if (existingCharIndex !== -1) {
                    const char = newInventory[existingCharIndex];
                    if (char.stars < MAX_STARS) {
                        newInventory[existingCharIndex] = { ...char, stars: char.stars + 1 };
                    } else {
                        const costPerPull = cost / baseIds.length;
                        refundCurrency += (costPerPull / 2);
                    }
                } else {
                    const baseChar = CHARACTERS.find(c => c.id === baseId);
                    newInventory.push({
                        uid: Date.now().toString() + Math.random(),
                        baseId: baseId,
                        stars: 1,
                        level: 1,
                        stats: { ...baseChar.stats },
                        equipment: { head: null, chest: null, legs: null, feet: null, arms: null, hands: null, weapon: null }
                    });
                }
            });

            return {
                ...state,
                headhuntTickets: state.headhuntTickets - cost,
                currency: state.currency + refundCurrency,
                inventory: newInventory
            };
        }

        case 'BATTLE_WIN': {
            const { drops } = action.payload;
            let newTickets = state.headhuntTickets + (drops.tickets || 0);
            let newCurrency = state.currency + (drops.currency || 0);
            let newItems = [...state.items];

            if (drops.items) {
                drops.items.forEach(newItem => {
                    newItems.push({
                        ...newItem,
                        uid: Date.now() + Math.random().toString(),
                        count: 1,
                        level: 0,
                        substats: []
                    });
                });
            }
            if (drops.materials) {
                drops.materials.forEach(newMat => {
                    const existingMat = newItems.find(i => i.id === newMat.id);
                    if (existingMat) {
                        existingMat.count += (newMat.count || 1);
                    } else {
                        newItems.push({ ...newMat, uid: Date.now() + Math.random().toString(), count: (newMat.count || 1) });
                    }
                });
            }

            return { ...state, headhuntTickets: newTickets, currency: newCurrency, items: newItems };
        }

        case 'UPGRADE_ITEM': {
            const { itemUid } = action.payload;

            // 1. Find item in Items (unequipped) logic
            let itemsList = [...state.items];
            let itemIndex = itemsList.findIndex(i => i.uid === itemUid);
            let item = null;
            let isEquipped = false;
            let charId = null;
            let slot = null;

            if (itemIndex !== -1) {
                item = itemsList[itemIndex];
            } else {
                // Check inventory (equipped items)
                // This is expensive but necessary if upgrading properly from equipped state
                // Actually, our EQUIP_ITEM implementation keeps equipping logic syncs to 'items' list for metadata?
                // Let's check `state.inventory` to find the item
                for (const char of state.inventory) {
                    if (char.equipment) {
                        for (const [s, i] of Object.entries(char.equipment)) {
                            if (i && i.uid === itemUid) {
                                item = i;
                                isEquipped = true;
                                charId = char.uid;
                                slot = s;
                                break;
                            }
                        }
                    }
                    if (item) break;
                }
            }

            if (!item) return state;

            const currentLevel = item.level || 0;
            if (currentLevel >= 10) return state; // Max +10

            const cost = (currentLevel + 1) * 500;
            if (state.currency < cost) return state;

            // Generate Substat
            const substatDef = SUBSTAT_POOL[Math.floor(Math.random() * SUBSTAT_POOL.length)];
            const val = Math.floor(Math.random() * (substatDef.max - substatDef.min + 1)) + substatDef.min;
            const newSubstat = { stat: substatDef.stat, value: val };

            const newItemState = {
                ...item,
                level: currentLevel + 1,
                substats: [...(item.substats || []), newSubstat]
            };

            // Apply Update
            let newItems = [...state.items];
            let newInventory = [...state.inventory];

            // Update in global list
            // Note: If item was found in inventory but NOT in items list (bug?), we might miss it here
            // But we should always keep items list as source of truth for object data ideally, 
            // OR we just update wherever we found it.
            // Our previous logic syncs metadata 'equippedBy' to items list.
            // So if item is in inventory, it SHOULD be in items list too unless we deleted it?

            // Let's update global list first
            const globalIndex = newItems.findIndex(i => i.uid === itemUid);
            if (globalIndex !== -1) {
                newItems[globalIndex] = { ...newItems[globalIndex], ...newItemState };
            }

            // Update in inventory if equipped
            if (isEquipped) {
                const charIndex = newInventory.findIndex(c => c.uid === charId);
                if (charIndex !== -1) {
                    newInventory[charIndex] = {
                        ...newInventory[charIndex],
                        equipment: {
                            ...newInventory[charIndex].equipment,
                            [slot]: newItemState
                        }
                    };
                }
            }

            return {
                ...state,
                currency: state.currency - cost,
                items: newItems,
                inventory: newInventory
            };
        }

        case 'EQUIP_ITEM': {
            const { charId, slot, item } = action.payload;
            const charIndex = state.inventory.findIndex(c => c.uid === charId);
            if (charIndex === -1) return state;

            let newInventory = [...state.inventory];
            let newItems = [...state.items];

            // 1. Check if item is already equipped by ANYONE (Search Inventory Source of Truth)
            // This prevents duplication if item metadata is stale
            for (let i = 0; i < newInventory.length; i++) {
                const char = newInventory[i];
                if (!char.equipment) continue;

                // Check all slots of this character
                for (const [equipSlot, equipItem] of Object.entries(char.equipment)) {
                    if (equipItem && equipItem.uid === item.uid) {
                        // Found the item! Unequip it.
                        // Note: If charId === char.uid, we are just moving slots or re-equipping, which is fine to unequip first
                        newInventory[i] = {
                            ...char,
                            equipment: {
                                ...char.equipment,
                                [equipSlot]: null
                            }
                        };
                    }
                }
            }

            // 2. Equip to new owner
            // Re-fetch charIndex because we might have modified newInventory array above
            const updatedCharIndex = newInventory.findIndex(c => c.uid === charId);

            newInventory[updatedCharIndex] = {
                ...newInventory[updatedCharIndex],
                equipment: {
                    ...newInventory[updatedCharIndex].equipment,
                    [slot]: { ...item, equippedBy: charId }
                }
            };

            // 3. Sync Item Metadata for UI
            const itemIndex = newItems.findIndex(i => i.uid === item.uid);
            if (itemIndex !== -1) {
                newItems[itemIndex] = { ...newItems[itemIndex], equippedBy: charId };
            }

            return { ...state, inventory: newInventory, items: newItems };
        }

        case 'UNEQUIP_ITEM': {
            const { charId, slot } = action.payload;
            const charIndex = state.inventory.findIndex(c => c.uid === charId);
            if (charIndex === -1) return state;

            let newInventory = [...state.inventory];
            let newItems = [...state.items];

            const itemToUnequip = newInventory[charIndex].equipment[slot];

            if (itemToUnequip) {
                // Update global item list
                const itemIndex = newItems.findIndex(i => i.uid === itemToUnequip.uid);
                if (itemIndex !== -1) {
                    newItems[itemIndex] = { ...newItems[itemIndex], equippedBy: null };
                }
            }

            newInventory[charIndex] = {
                ...newInventory[charIndex],
                equipment: {
                    ...newInventory[charIndex].equipment,
                    [slot]: null
                }
            };

            return { ...state, inventory: newInventory, items: newItems };
        }

        case 'TOGGLE_ARENA': {
            const { charId } = action.payload;
            const isInArena = state.arenaRoster.includes(charId);
            let newRoster = [...state.arenaRoster];

            if (isInArena) {
                newRoster = newRoster.filter(id => id !== charId);
            } else {
                if (newRoster.length >= 5) return state;
                newRoster.push(charId);
            }

            return { ...state, arenaRoster: newRoster };
        }

        case 'ASSIGN_LAB_CHAR': {
            const { slotIndex, charId } = action.payload;
            // Validate slot index based on level
            if (slotIndex >= state.lab.level) return state; // Locked slot

            let newSlots = [...state.lab.slots];

            // If char is already in another slot, remove them from there
            const existingSlot = newSlots.findIndex(uid => uid === charId);
            if (existingSlot !== -1) {
                newSlots[existingSlot] = null;
            }

            newSlots[slotIndex] = charId;
            return { ...state, lab: { ...state.lab, slots: newSlots } };
        }

        case 'REMOVE_LAB_CHAR': {
            const { slotIndex } = action.payload;
            let newSlots = [...state.lab.slots];
            newSlots[slotIndex] = null;
            return { ...state, lab: { ...state.lab, slots: newSlots } };
        }

        case 'UPGRADE_LAB': {
            const currentLevel = state.lab.level;
            if (currentLevel >= 5) return state;

            // Simple Cost: Level * 2000 Gold + Level * 5 Battle Records
            const goldCost = currentLevel * 2000;
            const matCost = { id: 'mat_battle_record_1', count: currentLevel * 5 };

            if (state.currency < goldCost) return state;

            let newItems = [...state.items];
            const matIndex = newItems.findIndex(i => i.id === matCost.id);
            if (matIndex === -1 || newItems[matIndex].count < matCost.count) return state;

            // Deduct Materials
            newItems[matIndex] = { ...newItems[matIndex], count: newItems[matIndex].count - matCost.count };
            if (newItems[matIndex].count <= 0) newItems.splice(matIndex, 1);

            return {
                ...state,
                currency: state.currency - goldCost,
                items: newItems,
                lab: { ...state.lab, level: currentLevel + 1 }
            };
        }

        case 'CLAIM_LAB_GOLD': {
            // Logic is handled in component? No, reducer should handle state update
            // But component needs to calculate amount to show?
            // Let's rely on payload for amount to be safe/consistent or calculate inside
            // Calculating inside is safer against cheats, but we need access to inventory to check levels

            const now = Date.now();
            const lastClaim = state.lab.lastClaimTime;
            const diffMinutes = (now - lastClaim) / 1000 / 60; // Minutes

            if (diffMinutes < 1) return state; // Minimum 1 minute to claim?

            let totalLevel = 0;
            state.lab.slots.forEach(uid => {
                if (uid) {
                    const char = state.inventory.find(c => c.uid === uid);
                    if (char) totalLevel += (char.level || 1);
                }
            });

            // Production Rate: 10 Gold per Level per Minute
            const incomePerMinute = totalLevel * 10;
            const totalIncome = Math.floor(diffMinutes * incomePerMinute);

            if (totalIncome <= 0) return state;

            return {
                ...state,
                currency: state.currency + totalIncome,
                lab: { ...state.lab, lastClaimTime: now }
            };
        }

        default:
            return state;
    }
};

import { useAuth } from './AuthContext';

export const GameProvider = ({ children }) => {
    const { user } = useAuth();
    const saveKey = user ? `gacha_save_${user.id}` : 'gacha_save_guest';

    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, (initial) => {
        const saved = localStorage.getItem(saveKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...initial, ...parsed };
            } catch (e) {
                console.error("Failed to parse save game:", e);
                return initial;
            }
        }
        return initial;
    });

    useEffect(() => {
        if (state !== INITIAL_STATE) {
            localStorage.setItem(saveKey, JSON.stringify(state));
        }
    }, [state, saveKey]);

    useEffect(() => {
        const interval = setInterval(() => {
            let totalPower = 0;
            state.arenaRoster.forEach(uid => {
                const char = state.inventory.find(c => c.uid === uid);
                if (char) {
                    totalPower += calculatePower(char);
                }
            });

            if (totalPower > 0) {
                const income = Math.max(1, Math.floor(totalPower / 10));
                dispatch({ type: 'ADD_CURRENCY', payload: income });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [state.arenaRoster, state.inventory]);

    return (
        <GameContext.Provider value={{ state, dispatch, calculatePower, calculateStats }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
