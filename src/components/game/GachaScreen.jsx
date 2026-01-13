import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { CHARACTERS } from '../../data/characters';
import { Button, Card, StarDisplay } from '../ui/Components';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Terminal, Search, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';

const SUMMON_COST = 1; // 1 Ticket per pull

export const GachaScreen = () => {
    const { state, dispatch } = useGame();
    const [isPulling, setIsPulling] = useState(false);
    const [pullResult, setPullResult] = useState(null);

    const handleSummon = () => {
        if (state.headhuntTickets < SUMMON_COST) return;

        setIsPulling(true);
        setPullResult(null);

        // Simulation delay for "System Processing"
        setTimeout(() => {
            // Random Logic
            const random = Math.random();
            let selectedChar = CHARACTERS.find(c => c.name === 'Neon Blade'); // Default fallback

            // Simple weighted pull
            const pool = CHARACTERS;
            // In a real app, logic would be complex. For demo, pick random.
            selectedChar = pool[Math.floor(Math.random() * pool.length)];

            dispatch({
                type: 'ROLL_CHARACTER',
                payload: { baseId: selectedChar.id, cost: SUMMON_COST }
            });

            setPullResult(selectedChar);
            setIsPulling(false);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 relative">

            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-12">

                {/* Recruitment Terminal Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-tech-primary font-mono text-xs tracking-[0.3em] uppercase opacity-70">
                        <Terminal className="w-4 h-4" />
                        <span>Headhunting Terminal System</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white glitch-text" data-text="RECRUIT">
                        RECRUIT
                    </h1>
                    <p className="text-zinc-500 max-w-md mx-auto font-mono text-sm leading-relaxed border-l-2 border-tech-primary/50 pl-4 py-1 text-left bg-gradient-to-r from-tech-primary/5 to-transparent">
                        Authorize signal trace for new operator acquisition. High-energy signatures detected in sector 7RG.
                    </p>
                </div>

                {/* Summon Action Area */}
                <AnimatePresence mode="wait">
                    {!pullResult && !isPulling && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-tech-surface p-1 border border-tech-border clip-angle"
                        >
                            <div className="bg-black/40 p-8 flex flex-col items-center gap-6 min-w-[320px] text-center">
                                <div className="w-full flex justify-between text-xs text-zinc-500 font-mono uppercase">
                                    <span>Signal Strength</span>
                                    <span>100%</span>
                                </div>
                                <div className="w-full h-px bg-zinc-800"></div>

                                <div className="space-y-4">
                                    <div className="text-4xl font-bold text-white tabular-nums tracking-widest">
                                        {SUMMON_COST} <span className="text-sm text-zinc-500">TICKET</span>
                                    </div>
                                    <Button
                                        onClick={handleSummon}
                                        disabled={state.headhuntTickets < SUMMON_COST}
                                        size="lg"
                                        className="w-full"
                                    >
                                        <Zap className="w-4 h-4 mr-2" />
                                        INITIATE SCAN
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isPulling && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-4 border-tech-primary/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-0 border-4 border-t-tech-primary rounded-full animate-spin"></div>
                                <Search className="absolute inset-0 m-auto w-8 h-8 text-tech-primary animate-pulse" />
                            </div>
                            <p className="font-mono text-tech-primary tracking-widest text-sm animate-pulse">DECODING BIOMETRICS...</p>
                        </motion.div>
                    )}

                    {pullResult && (
                        <ResultCard character={pullResult} onDismiss={() => setPullResult(null)} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ResultCard = ({ character, onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-tech-surface border border-tech-border relative clip-angle overflow-hidden group"
        >
            {/* Operator Art Background */}
            <div className="absolute inset-0 opacity-40">
                <img src={character.image} className="w-full h-full object-cover grayscale mix-blend-luminosity group-hover:grayscale-0 transition-all duration-700 blur-sm group-hover:blur-0" />
                <div className="absolute inset-0 bg-gradient-to-r from-tech-surface via-tech-surface/90 to-transparent"></div>
            </div>

            <div className="relative z-10 grid grid-cols-[1fr_200px] gap-8 p-8 h-[400px]">
                {/* Info Column */}
                <div className="flex flex-col justify-end items-start space-y-4">
                    <div className="bg-tech-primary text-black text-xs font-bold px-2 py-1 uppercase tracking-widest mb-2">
                        Acquisition Complete
                    </div>
                    <h2 className="text-6xl font-bold uppercase tracking-tighter text-white/90">
                        {character.name}
                    </h2>

                    {/* Stat Matrix */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs text-zinc-400 mt-4 border-t border-zinc-700 pt-4 w-full">
                        <div className="flex justify-between">
                            <span>ATK</span>
                            <span className="text-white">{character.stats.attack}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>DEF</span>
                            <span className="text-white">{character.stats.defense}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>SPD</span>
                            <span className="text-white">{character.stats.speed}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VIT</span>
                            <span className="text-white">{character.stats.health}</span>
                        </div>
                    </div>

                    <div className="pt-8">
                        <Button variant="secondary" onClick={onDismiss} className="gap-2">
                            CONFIRM <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Portrait Column */}
                <div className="relative h-full border-l border-white/10 pl-4 hidden md:block">
                    <div className="h-full w-full bg-black/50 border border-white/10 p-1">
                        <img src={character.image} className="w-full h-full object-cover filter contrast-125" />
                    </div>
                </div>
            </div>

            {/* Deco Lines */}
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-600">ID: {character.id.substring(0, 8).toUpperCase()}</div>
        </motion.div>
    );
};
