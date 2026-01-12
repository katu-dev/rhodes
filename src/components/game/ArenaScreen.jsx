import { useGame } from '../../context/GameContext';
import { CHARACTERS } from '../../data/characters';
import { Button } from '../ui/Components';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Zap, Crosshair, Users, Shield, Plus } from 'lucide-react';

export const ArenaScreen = () => {
    const { state, dispatch, calculatePower } = useGame();

    const handleToggleArena = (charId) => {
        dispatch({ type: 'TOGGLE_ARENA', payload: { charId } });
    };

    // Calculate total arena power
    const totalPower = state.arenaRoster.reduce((sum, uid) => {
        const char = state.inventory.find(c => c.uid === uid);
        return sum + (char ? calculatePower(char) : 0);
    }, 0);

    const incomeRate = Math.max(0, Math.floor(totalPower / 10));

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Mission Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-tech-surface border border-tech-border clip-angle relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2 text-tech-accent text-xs font-mono uppercase tracking-widest">
                        <Zap className="w-4 h-4" />
                        <span>Generator Output</span>
                    </div>
                    <div className="text-4xl font-bold font-mono text-white tabular-nums">
                        {incomeRate} <span className="text-sm text-zinc-500">LMD/SEC</span>
                    </div>
                    <p className="text-xs text-zinc-500 max-w-sm">
                        Deploy operators to Sector 09 to maintain power generation efficiency.
                    </p>
                </div>

                <div className="relative z-10 text-right">
                    <div className="text-xs font-mono text-zinc-500 uppercase">Total Combat Power</div>
                    <div className="text-2xl font-bold text-white tabular-nums">{totalPower}</div>
                    <div className="text-xs font-mono text-tech-primary uppercase mt-1">SQUAD SIZE: {state.arenaRoster.length}/5</div>
                </div>

                {/* Background Deco */}
                <div className="absolute right-0 top-0 h-full w-32 bg-tech-primary/5 -skew-x-12 transform origin-bottom-right"></div>
            </div>

            <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
                {/* Available Roster (Left Panel) */}
                <div className="lg:col-span-1 border border-tech-border bg-black/40 flex flex-col min-h-0">
                    <div className="p-3 border-b border-tech-border bg-tech-surface/50 flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-widest text-zinc-400">Reserve Unit</span>
                        <Users className="w-4 h-4 text-zinc-600" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {state.inventory.map(char => {
                            const isDeployed = state.arenaRoster.includes(char.uid);
                            const baseData = CHARACTERS.find(c => c.id === char.baseId);
                            if (!baseData) return null;

                            return (
                                <button
                                    key={char.uid}
                                    onClick={() => handleToggleArena(char.uid)}
                                    disabled={!isDeployed && state.arenaRoster.length >= 5}
                                    className={clsx(
                                        "w-full flex items-center gap-3 p-2 border transition-all text-left",
                                        isDeployed
                                            ? "border-tech-primary bg-tech-primary/10 opacity-50"
                                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800"
                                    )}
                                >
                                    <div className="w-10 h-10 border border-zinc-700 bg-black overflow-hidden shrink-0">
                                        <img src={baseData.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-zinc-300 truncate">{baseData.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-mono">PWR: {calculatePower(char)}</div>
                                    </div>
                                    {isDeployed && <div className="text-[10px] font-bold text-tech-primary uppercase">ACTIVE</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Deployment Zone (Center/Right) */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="h-full border border-tech-border bg-tech-grid relative overflow-hidden flex items-center justify-center p-8">
                        {/* Map Overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_70%)] pointer-events-none"></div>

                        {/* Deployment Slots */}
                        <div className="grid grid-cols-5 gap-4 relative z-10 w-full max-w-2xl">
                            {/* Render 5 fixed slots */}
                            {Array.from({ length: 5 }).map((_, i) => {
                                const charId = state.arenaRoster[i];
                                const char = charId ? state.inventory.find(c => c.uid === charId) : null;

                                return (
                                    <div key={i} className="aspect-[3/4] relative">
                                        {char ? (
                                            <motion.div
                                                layoutId={`slot-${char.uid}`}
                                                className="w-full h-full border border-tech-primary bg-tech-surface relative group"
                                            >
                                                <img
                                                    src={CHARACTERS.find(c => c.id === char.baseId)?.image}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                                <button
                                                    onClick={() => handleToggleArena(char.uid)}
                                                    className="absolute -top-2 -right-2 bg-black border border-tech-primary text-tech-primary w-6 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors z-20"
                                                >
                                                    <span className="text-xs font-bold">×</span>
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-center border-t border-tech-primary/50">
                                                    <div className="text-[9px] font-mono text-white truncate">
                                                        {CHARACTERS.find(c => c.id === char.baseId)?.name || 'Unknown'}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="w-full h-full border border-dashed border-zinc-700 bg-black/20 flex flex-col items-center justify-center gap-2 text-zinc-700 hover:border-zinc-500 hover:text-zinc-500 transition-colors">
                                                <Plus className="w-6 h-6" />
                                                <span className="text-[9px] font-bold font-mono tracking-widest">VACANT</span>
                                            </div>
                                        )}

                                        {/* Deployment Marker */}
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-800"></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
