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

            const newInventory = [...state.inventory];
            newInventory[charIndex] = {
                ...newInventory[charIndex],
                equipment: {
                    ...newInventory[charIndex].equipment,
                    [slot]: item
                }
            };

            return { ...state, inventory: newInventory };
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

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, (initial) => {
        // Load from local storage if available
        const saved = localStorage.getItem('gacha_save_v2');
        return saved ? JSON.parse(saved) : initial;
    });

    // Persist save
    useEffect(() => {
        localStorage.setItem('gacha_save_v2', JSON.stringify(state));
    }, [state]);

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
