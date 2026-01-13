import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ENEMIES } from '../../data/enemies';
import { ITEMS, MATERIALS } from '../../data/items';
import { Sword, Shield, Activity, Users, Trophy, Ticket, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BattleScreen() {
    const { state, dispatch, calculateStats } = useGame();
    const [selectedSquad, setSelectedSquad] = useState([]);
    const [battleState, setBattleState] = useState('idle'); // idle, fighting, victory, defeat
    const [battleLog, setBattleLog] = useState([]);
    const [rewards, setRewards] = useState(null);
    const [currentTurn, setCurrentTurn] = useState(0);

    // Filter available characters unique by UID
    const roster = state.inventory;

    const toggleUnit = (uid) => {
        if (selectedSquad.includes(uid)) {
            setSelectedSquad(selectedSquad.filter(id => id !== uid));
        } else {
            if (selectedSquad.length < 4) {
                setSelectedSquad([...selectedSquad, uid]);
            }
        }
    };

    const startBattle = () => {
        if (selectedSquad.length === 0) return;
        setBattleState('fighting');
        setBattleLog(['Battle Started!']);
        setCurrentTurn(0);

        // Simulate Battle Logic
        // For simplicity, we'll do a turn-based calculation in a timeout loop
        // In a real app, this would be more complex state
    };

    useEffect(() => {
        if (battleState !== 'fighting') return;

        const battleLoop = async () => {
            // Setup Teams
            let allies = selectedSquad.map(uid => {
                const char = state.inventory.find(c => c.uid === uid);
                return {
                    ...char,
                    currentHp: calculateStats(char).health,
                    maxHp: calculateStats(char).health,
                    stats: calculateStats(char),
                    team: 'ally'
                };
            });

            // Deep copy enemies to track HP
            let enemies = ENEMIES.map(e => ({
                ...e,
                currentHp: e.stats.health,
                maxHp: e.stats.health,
                uid: e.id + Math.random(),
                team: 'enemy'
            }));

            let log = [];
            let round = 1;

            while (allies.some(a => a.currentHp > 0) && enemies.some(e => e.currentHp > 0)) {
                // await new Promise(r => setTimeout(r, 500)); // Delay for effect (simulated here instantly for logic, visually we might want delay)

                // Simple Round: All allies attack random enemy, All enemies attack random ally
                // Sort by speed?
                const allUnits = [...allies, ...enemies].sort((a, b) => b.stats.speed - a.stats.speed);

                for (const unit of allUnits) {
                    if (unit.currentHp <= 0) continue;

                    const targets = unit.team === 'ally' ? enemies : allies;
                    const liveTargets = targets.filter(t => t.currentHp > 0);

                    if (liveTargets.length === 0) break;

                    const target = liveTargets[Math.floor(Math.random() * liveTargets.length)];

                    // DMG Formula
                    const dmg = Math.max(1, unit.stats.attack - target.stats.defense);
                    target.currentHp -= dmg;

                    log.push(`${unit.name || (unit.baseId ? state.inventory.find(i => i.uid === unit.uid)?.baseId : 'Enemy')} hit ${target.name} for ${dmg} DMG!`);

                    if (target.currentHp <= 0) {
                        log.push(`${target.name} was defeated!`);
                    }
                }

                // Force update log occasionally or at end
                round++;
                if (round > 50) break; // Safety break
            }

            setBattleLog(log);

            if (allies.some(a => a.currentHp > 0)) {
                setBattleState('victory');
                generateRewards();
            } else {
                setBattleState('defeat');
            }
        };

        // Run simulation with a slight delay to let UI transition
        const timer = setTimeout(battleLoop, 1000);
        return () => clearTimeout(timer);

    }, [battleState]);

    const generateRewards = () => {
        // RNG Rewards
        const gainedCurrency = Math.floor(Math.random() * 50) + 10;
        const drops = {
            currency: gainedCurrency,
            items: [],
            materials: [],
            tickets: 0
        };

        // 50% chance for material
        if (Math.random() > 0.5) {
            const mat = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
            drops.materials.push(mat);
        }

        // 20% chance for item
        if (Math.random() > 0.8) {
            const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            drops.items.push(item);
        }

        // 5% chance for ticket
        if (Math.random() > 0.95) {
            drops.tickets = 1;
        }

        setRewards(drops);
        dispatch({ type: 'BATTLE_WIN', payload: { drops } });
    };

    return (
        <div className="h-full w-full relative flex flex-col overflow-hidden font-display">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            <header className="p-6 pb-2 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-red-500 font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-1">
                        <Activity className="w-4 h-4" />
                        <span>Combat Simulation Module</span>
                    </div>
                    <h1 className="text-5xl font-bold uppercase tracking-tighter text-white glitch-text" data-text="OPERATION">
                        OPERATION
                    </h1>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Sector 7RG</div>
                    <div className="text-2xl font-bold text-tech-primary uppercase">Assault Mode</div>
                </div>
            </header>

            {battleState === 'idle' && (
                <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 min-h-0 z-10">
                    {/* Squad Selection */}
                    <div className="flex-1 bg-tech-surface clip-angle border border-tech-border flex flex-col relative group">
                        {/* Decor Corner */}
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                            <div className="w-16 h-1 bg-tech-primary"></div>
                        </div>

                        <div className="p-4 border-b border-tech-border bg-black/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2 text-white/90">
                                <Users size={20} className="text-tech-primary" />
                                Squad Selection
                            </h2>
                            <span className="font-mono text-tech-primary text-xl font-bold">{selectedSquad.length} / 4</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {roster.map(char => {
                                const stats = calculateStats(char);
                                const isSelected = selectedSquad.includes(char.uid);
                                return (
                                    <button
                                        key={char.uid}
                                        onClick={() => toggleUnit(char.uid)}
                                        className={`relative p-3 border text-left transition-all group/card overflow-hidden ${isSelected
                                                ? 'bg-tech-primary/10 border-tech-primary'
                                                : 'bg-black/40 border-tech-border hover:border-zinc-500'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold uppercase tracking-wider truncate text-sm">{state.inventory.find(c => c.uid === char.uid)?.baseId}</div>
                                            <div className="text-[10px] font-mono text-zinc-500">LV.{char.stars}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-400">
                                            <div>ATK {stats.attack}</div>
                                            <div>DEF {stats.defense}</div>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-0 right-0 w-3 h-3 bg-tech-primary"></div>
                                        )}
                                        {/* Hover Glitch Line */}
                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-tech-primary transition-all group-hover/card:w-full"></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enemy Preview */}
                    <div className="w-full md:w-1/3 bg-black/40 backdrop-blur-sm border border-red-900/40 p-1 clip-angle-inv flex flex-col">
                        <div className="bg-red-950/20 p-6 flex-1 flex flex-col gap-4 border border-red-900/20">
                            <h2 className="text-xl font-bold uppercase text-red-500 tracking-widest border-b border-red-900/30 pb-2">
                                Hostiles Detected
                            </h2>
                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {ENEMIES.map(enemy => (
                                    <div key={enemy.id} className="flex items-center gap-4 bg-black/60 p-3 border-l-2 border-red-800">
                                        <img src={enemy.image} className="w-12 h-12 grayscale contrast-125 object-cover" alt={enemy.name} />
                                        <div>
                                            <div className="font-bold text-red-100 uppercase text-sm">{enemy.name}</div>
                                            <div className="text-[10px] font-mono text-red-400 tracking-wider">
                                                HP {enemy.stats.health} // ATK {enemy.stats.attack}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={selectedSquad.length === 0}
                                onClick={startBattle}
                                className="w-full py-5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl uppercase tracking-widest text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all clip-angle hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]"></div>
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Sword size={20} /> Initiate Combat
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {battleState === 'fighting' && (
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    <div className="w-full max-w-4xl border-y border-red-500/30 bg-black/80 backdrop-blur-md p-12 text-center relative overflow-hidden">
                        {/* Scanning Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-scan"></div>

                        <Sword size={64} className="text-red-500 mb-6 mx-auto animate-pulse" />
                        <h2 className="text-4xl font-bold uppercase tracking-[0.2em] text-red-500 mb-2">Combat In Progress</h2>
                        <p className="font-mono text-red-200/50 text-sm animate-pulse">SIMULATING TACTICAL OUTCOME...</p>

                        <div className="mt-8 flex justify-center gap-1">
                            <div className="w-2 h-8 bg-red-600 animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-8 bg-red-600 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-8 bg-red-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {(battleState === 'victory' || battleState === 'defeat') && (
                <div className="flex-1 flex items-center justify-center z-10 p-6">
                    <div className="w-full max-w-3xl bg-tech-surface border border-tech-border p-1 relative clip-angle">
                        <div className="bg-black/90 p-8 flex flex-col items-center relative overflow-hidden">
                            {/* Background Ray */}
                            <div className={`absolute -top-[50%] -left-[50%] w-[200%] h-[200%] ${battleState === 'victory' ? 'bg-yellow-500/5' : 'bg-red-500/5'} animate-spin-slow pointer-events-none`}></div>

                            {battleState === 'victory' ? (
                                <>
                                    <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2 drop-shadow-glow">
                                        VICTORY
                                    </h2>
                                    <div className="w-24 h-1 bg-yellow-500 mb-8"></div>

                                    {rewards && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
                                            <div className="bg-zinc-900 border border-zinc-800 p-4 flex flex-col items-center gap-2">
                                                <Coins className="text-yellow-400" />
                                                <div className="font-bold text-xl text-white">+{rewards.currency}</div>
                                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">LMD</div>
                                            </div>

                                            {rewards.tickets > 0 && (
                                                <div className="bg-zinc-900 border border-red-900/50 p-4 flex flex-col items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                                    <Ticket className="text-red-500" />
                                                    <div className="font-bold text-xl text-white">+{rewards.tickets}</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Permit</div>
                                                </div>
                                            )}

                                            {rewards.materials.map((mat, i) => (
                                                <div key={i} className="bg-zinc-900 border border-blue-900/50 p-4 flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-500/20 border border-blue-500 rounded-sm"></div>
                                                    <div className="font-bold text-sm text-center truncate w-full">{mat.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter text-red-600 mb-2 glitch-text" data-text="DEFEAT">
                                        DEFEAT
                                    </h2>
                                    <div className="w-24 h-1 bg-red-600 mb-8"></div>
                                    <p className="text-red-200/60 font-mono mb-8">MISSION FAILED • SQUAD NEUTRALIZED</p>
                                </>
                            )}

                            <div className="w-full bg-black border border-white/10 p-4 h-32 overflow-y-auto mb-8 font-mono text-[10px] text-zinc-500 space-y-1 scrollbar-thin">
                                {battleLog.map((line, i) => (
                                    <div key={i} className="border-b border-white/5 pb-1">
                                        <span className="text-zinc-700 mr-2">[{String(i).padStart(3, '0')}]</span>
                                        {line}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setBattleState('idle')}
                                className="px-12 py-3 bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform clip-angle"
                            >
                                Return to Base
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}

// Add CSS for spin-slow/bounce-subtle if adding to index.css later, or rely on tailwind defaults
```
