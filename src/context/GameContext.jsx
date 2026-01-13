import { createContext, useContext, useReducer, useEffect } from 'react';
import { CHARACTERS, MAX_STARS } from '../data/characters';
import { ITEMS, MATERIALS } from '../data/items';
import { ENEMIES } from '../data/enemies';

const GameContext = createContext();

const INITIAL_STATE = {
    currency: 1000, // Starting currency (Gold)
    headhuntTickets: 5, // Starting Headhunt Tickets
    inventory: [], // Array of OwnedCharacter objects
    items: [], // Empty items by default
    arenaRoster: [], // Array of inventory IDs
    lastTick: Date.now(),
};

/*
  OwnedCharacter Structure:
  {
    uid: string (unique instance id),
    baseId: string (ref to CHARACTERS),
    stars: number (1-25),
    stats: { ... }, // Base stats + star bonuses
    equipment: {
      head: null,
      chest: null,
      ...
    }
  }
*/

const calculateStats = (char) => {
    const { attack, defense, health, speed } = char.stats;

    // Add equipment stats
    let bonusStats = { attack: 0, defense: 0, health: 0, speed: 0 };
    if (char.equipment) {
        Object.values(char.equipment).forEach(item => {
            if (item) {
                if (item.stats.attack) bonusStats.attack += item.stats.attack;
                if (item.stats.defense) bonusStats.defense += item.stats.defense;
                if (item.stats.health) bonusStats.health += item.stats.health;
                if (item.stats.speed) bonusStats.speed += item.stats.speed;
            }
        });
    }

    return {
        attack: attack + bonusStats.attack,
        defense: defense + bonusStats.defense,
        health: health + bonusStats.health,
        speed: speed + bonusStats.speed
    };
};

const calculatePower = (char) => {
    const stats = calculateStats(char);
    return Math.floor(stats.attack * 2 + stats.defense * 1.5 + stats.health * 0.5 + stats.speed * 2);
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_CURRENCY':
            return {
                ...state,
                currency: state.currency + action.payload
            };

        case 'SPEND_CURRENCY':
            if (state.currency < action.payload) return state;
            return {
                ...state,
                currency: state.currency - action.payload
            };

        case 'ROLL_CHARACTER': {
            // Logic for rolling
            // 1. Check Cost (handled by caller or wrapper, but good checks here too)
            // 2. Randomly select base character
            // 3. Check if owned
            // 4. If new -> Add to inventory (1 star)
            // 5. If owned -> Increment stars (cap at 25)

            const { baseId, cost } = action.payload; // Passed from randomization logic or component

            const existingCharIndex = state.inventory.findIndex(c => c.baseId === baseId);
            let newInventory = [...state.inventory];

            if (existingCharIndex !== -1) {
                // Upgrade
                const char = newInventory[existingCharIndex];
                if (char.stars < MAX_STARS) {
                    // Recalculate stats for the new star level
                    // For simplicity, +10% base stats per star
                    const newStars = char.stars + 1;
                    const baseChar = CHARACTERS.find(c => c.id === baseId);
                    const multiplier = 1 + (newStars - 1) * 0.1;

                    newInventory[existingCharIndex] = {
                        ...char,
                        stars: newStars,
                        stats: {
                            attack: Math.floor(baseChar.stats.attack * multiplier),
                            defense: Math.floor(baseChar.stats.defense * multiplier),
                            health: Math.floor(baseChar.stats.health * multiplier),
                            speed: Math.floor(baseChar.stats.speed * multiplier),
                        }
                    };
                } else {
                    // Max stars reached, maybe give currency back?
                    return { ...state, currency: state.currency - cost + (cost / 2) }; // Refund half
                }
            } else {
                // New Character
                const baseChar = CHARACTERS.find(c => c.id === baseId);
                newInventory.push({
                    uid: Date.now().toString() + Math.random(),
                    baseId: baseId,
                    stars: 1,
                    stats: { ...baseChar.stats },
                    equipment: {
                        head: null, chest: null, legs: null, feet: null, arms: null, hands: null, weapon: null
                    }
                });
            }

            return {
                ...state,
                headhuntTickets: state.headhuntTickets - cost,
                inventory: newInventory
            };
        }

        case 'BATTLE_WIN': {
            const { drops } = action.payload; // drops: { items: [], materials: [], tickets: number, currency: number }

            // Add tickets
            let newTickets = state.headhuntTickets + (drops.tickets || 0);
            let newCurrency = state.currency + (drops.currency || 0);

            // Add Items/Materials
            let newItems = [...state.items];
            if (drops.items) {
                drops.items.forEach(newItem => {
                    newItems.push({ ...newItem, uid: Date.now() + Math.random().toString(), count: 1 });
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

            return {
                ...state,
                headhuntTickets: newTickets,
                currency: newCurrency,
                items: newItems
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

            // Also clear equippedBy for any item that was displaced from this slot ?
            // No, the displaced item just goes back to inventory (implicitly, as it's no longer in equipment map)
            // But we should update its metadata in 'items' list to say equippedBy: null
            // We can't know easily which item was displaced unless we check before overwrite.
            // But let's assume 'items' list 'equippedBy' is just for display helper. 
            // The true state is in inventory.

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
                // Max 5 in arena?
                if (newRoster.length >= 5) return state;
                newRoster.push(charId);
            }

            return { ...state, arenaRoster: newRoster };
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
        // Load from local storage if available
        const saved = localStorage.getItem(saveKey);
        return saved ? JSON.parse(saved) : initial;
    });

    // Persist save
    useEffect(() => {
        if (state !== INITIAL_STATE) {
            localStorage.setItem(saveKey, JSON.stringify(state));
        }
    }, [state, saveKey]);

    // Passive Income Ticker
    useEffect(() => {
        const interval = setInterval(() => {
            // Calculate total power in arena
            let totalPower = 0;
            state.arenaRoster.forEach(uid => {
                const char = state.inventory.find(c => c.uid === uid);
                if (char) {
                    totalPower += calculatePower(char);
                }
            });

            if (totalPower > 0) {
                // Income formula: 1 currency per 100 power per second?
                // Let's make it more generous for demo
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
