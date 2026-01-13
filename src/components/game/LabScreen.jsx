import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, Zap, ArrowUp, Clock, AlertCircle, X, Beaker } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { CHARACTERS } from '../../data/characters';
import { Button, StarDisplay } from '../ui/Components';
import clsx from 'clsx';

export const LabScreen = () => {
    const { state, dispatch } = useGame();
    const { lab, inventory } = state;
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

    // Update time for live gold calculation
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate Production Stats
    const assignedChars = lab.slots.map(uid => uid ? inventory.find(c => c.uid === uid) : null);
    const totalLevel = assignedChars.reduce((acc, char) => acc + (char ? (char.level || 1) : 0), 0);
    const incomePerMinute = totalLevel * 10;

    // Calculate Pending Gold
    const diffMinutes = (currentTime - lab.lastClaimTime) / 1000 / 60;
    const pendingGold = Math.max(0, Math.floor(diffMinutes * incomePerMinute));

    // Stats for upgrading
    const nextLevel = lab.level + 1;
    const canUpgrade = lab.level < 5;
    const upgradeCostGold = lab.level * 2000;
    const upgradeCostMatCount = lab.level * 5;
    const hasEnoughGold = state.currency >= upgradeCostGold;
    const hasEnoughMats = (state.items.find(i => i.id === 'mat_battle_record_1')?.count || 0) >= upgradeCostMatCount;

    const handleClaim = () => {
        if (pendingGold > 0) {
            dispatch({ type: 'CLAIM_LAB_GOLD' });
        }
    };

    const handleUpgrade = () => {
        if (canUpgrade && hasEnoughGold && hasEnoughMats) {
            dispatch({ type: 'UPGRADE_LAB' });
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Production Overview */}
                <div className="md:col-span-2 bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-tech-border p-6 relative overflow-hidden clip-angle">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Beaker className="text-tech-primary w-5 h-5" />
                                <h2 className="text-xl font-bold text-white tracking-widest uppercase">Research Lab</h2>
                            </div>
                            <div className="text-zinc-400 text-sm font-mono max-w-md">
                                Assign operatives to generate passive LMD income. Increase output by leveling up operatives and upgrading the facility.
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Facility Level</div>
                            <div className="text-4xl font-bold text-white font-mono">{lab.level}</div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-8 relative z-10">
                        <div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Output Rate</div>
                            <div className="text-2xl font-bold text-tech-primary font-mono flex items-center gap-1">
                                {incomePerMinute} <span className="text-sm text-zinc-500">LMD/MIN</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Staff</div>
                            <div className="text-2xl font-bold text-white font-mono">
                                {assignedChars.filter(Boolean).length} <span className="text-zinc-600">/ {lab.level}</span>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade Button */}
                    {canUpgrade && (
                        <div className="absolute bottom-6 right-6 z-10">
                            <Button
                                variant={hasEnoughGold && hasEnoughMats ? 'primary' : 'outline'}
                                size="sm"
                                onClick={handleUpgrade}
                                disabled={!hasEnoughGold || !hasEnoughMats}
                                className="flex items-center gap-2"
                            >
                                <ArrowUp size={14} />
                                <span>UPGRADE (LV.{nextLevel})</span>
                            </Button>
                            <div className="text-[9px] font-mono text-right mt-1 space-y-0.5">
                                <div className={hasEnoughGold ? 'text-zinc-400' : 'text-red-500'}>{upgradeCostGold} G</div>
                                <div className={hasEnoughMats ? 'text-zinc-400' : 'text-red-500'}>{upgradeCostMatCount}x REC</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Claim Panel */}
                <div className="bg-zinc-900 border border-tech-border p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0)_0px,rgba(0,0,0,0)_10px,rgba(34,211,238,0.05)_10px,rgba(34,211,238,0.05)_20px)] opacity-20 group-hover:opacity-40 transition-opacity"></div>

                    <div className="mb-4 relative z-10">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Accumulated Funds</div>
                        <div className="text-4xl font-bold text-white font-mono tracking-wider animate-pulse">
                            {pendingGold.toLocaleString()}
                        </div>
                        <div className="text-xs text-tech-accent font-bold mt-1">LMD</div>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full relative z-10"
                        onClick={handleClaim}
                        disabled={pendingGold <= 0}
                    >
                        CLAIM FUNDS
                    </Button>
                </div>
            </div>

            {/* Slots Grid */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={14} />
                    Assignments
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {lab.slots.map((charUid, idx) => {
                        const isLocked = idx >= lab.level;
                        const char = charUid ? inventory.find(c => c.uid === charUid) : null;
                        const baseChar = char ? CHARACTERS.find(c => c.id === char.baseId) : null;

                        return (
                            <div
                                key={idx}
                                className={clsx(
                                    "aspect-[3/4] border relative transition-all group",
                                    isLocked
                                        ? "bg-black/40 border-zinc-800 border-dashed text-zinc-700 flex flex-col items-center justify-center gap-2"
                                        : char
                                            ? "bg-zinc-900 border-tech-border hover:border-tech-primary/50 cursor-pointer overflow-hidden"
                                            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/30 cursor-pointer flex flex-col items-center justify-center text-zinc-500 hover:text-white"
                                )}
                                onClick={() => !isLocked && setSelectedSlotIndex(idx)}
                            >
                                {isLocked ? (
                                    <>
                                        <Clock size={24} />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Locked LV.{idx + 1}</span>
                                    </>
                                ) : char && baseChar ? (
                                    <>
                                        {/* Character Card */}
                                        <img src={baseChar.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <div className="text-xs font-bold text-white uppercase truncate">{baseChar.name}</div>
                                            <div className="flex items-center gap-1 text-[10px] font-mono text-tech-primary">
                                                <span>LV.{char.level}</span>
                                            </div>
                                        </div>

                                        {/* Remove Button (Hover) */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dispatch({ type: 'REMOVE_LAB_CHAR', payload: { slotIndex: idx } });
                                                }}
                                                className="bg-black/60 hover:bg-red-500/80 text-white p-1.5 rounded-full backdrop-blur-sm"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={32} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-40 group-hover:opacity-100">Assign</span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Character Selection Modal */}
            <AnimatePresence>
                {selectedSlotIndex !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSlotIndex(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-900 border border-tech-border w-full max-w-2xl h-[600px] flex flex-col clip-angle"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-tech-border flex justify-between items-center bg-black/40">
                                <h3 className="font-bold text-white tracking-widest uppercase text-sm">Select Operator</h3>
                                <button onClick={() => setSelectedSlotIndex(null)}><X size={20} className="text-zinc-500 hover:text-white" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {inventory.map(char => {
                                    const base = CHARACTERS.find(c => c.id === char.baseId);
                                    const isAssigned = lab.slots.includes(char.uid);
                                    // Check if assigned to THIS slot?
                                    const isAssignedToThis = lab.slots[selectedSlotIndex] === char.uid;
                                    const income = (char.level || 1) * 10;

                                    return (
                                        <button
                                            key={char.uid}
                                            onClick={() => {
                                                dispatch({ type: 'ASSIGN_LAB_CHAR', payload: { slotIndex: selectedSlotIndex, charId: char.uid } });
                                                setSelectedSlotIndex(null);
                                            }}
                                            disabled={isAssigned && !isAssignedToThis}
                                            className={clsx(
                                                "flex items-center gap-4 p-3 border text-left transition-all relative overflow-hidden group h-24",
                                                isAssignedToThis
                                                    ? "bg-tech-primary/10 border-tech-primary ring-1 ring-tech-primary"
                                                    : isAssigned
                                                        ? "opacity-60 grayscale border-zinc-800 bg-zinc-900/50 cursor-not-allowed"
                                                        : "bg-black/40 border-zinc-800 hover:border-tech-primary/50 hover:bg-zinc-800"
                                            )}
                                        >
                                            <div className="w-20 h-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 relative clip-angle">
                                                <img src={base.image} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-bold text-sm text-zinc-100 truncate group-hover:text-white">{base.name}</div>
                                                    <div className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-800">
                                                        LV.{char.level}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                                    <Zap size={12} className={clsx(isAssigned ? "text-zinc-600" : "text-tech-accent")} />
                                                    <span className={clsx("font-bold", isAssigned ? "text-zinc-500" : "text-tech-accent")}>
                                                        +{income} LMD/MIN
                                                    </span>
                                                </div>
                                            </div>

                                            {isAssigned && !isAssignedToThis && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/70 font-bold text-xs tracking-widest uppercase text-zinc-500 backdrop-blur-[1px]">
                                                    Assigned
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
