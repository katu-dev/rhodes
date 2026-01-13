import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { CHARACTERS } from '../../data/characters';
import { Button, Card, StarDisplay } from '../ui/Components';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Terminal, Search, ChevronRight, X, Sparkles, Briefcase, Ticket } from 'lucide-react';
import clsx from 'clsx';

const SUMMON_COST_SINGLE = 1;
const SUMMON_COST_TEN = 10;

export const GachaScreen = () => {
    const { state, dispatch } = useGame();
    const [isPulling, setIsPulling] = useState(false);
    const [pullResults, setPullResults] = useState(null); // Array of characters
    const [animationStage, setAnimationStage] = useState('idle'); // idle, zip, glow, open, reveal
    const [revealIndex, setRevealIndex] = useState(0);

    const handleSummon = (count) => {
        const cost = count * SUMMON_COST_SINGLE;
        if (state.headhuntTickets < cost) return;

        setIsPulling(true);
        setPullResults(null);
        setAnimationStage('zip');
        setRevealIndex(0);

        // 1. Determine Results immediately (frontend simulation)
        const results = [];
        for (let i = 0; i < count; i++) {
            // Simple weighted pull
            // 6*: 2%, 5*: 8%, 4*: 50%, 3*: 40%
            const rand = Math.random();
            let pool = [];
            if (rand > 0.98) pool = CHARACTERS.filter(c => c.stars === 6);
            else if (rand > 0.90) pool = CHARACTERS.filter(c => c.stars === 5);
            else if (rand > 0.40) pool = CHARACTERS.filter(c => c.stars === 4);
            else pool = CHARACTERS.filter(c => c.stars <= 3);

            if (pool.length === 0) pool = CHARACTERS; // Fallback
            const char = pool[Math.floor(Math.random() * pool.length)];
            results.push(char);
        }

        // 2. Dispatch Batch Logic
        dispatch({
            type: 'ROLL_BATCH',
            payload: { baseIds: results.map(c => c.id), cost: cost }
        });

        // 3. Start Animation Sequence
        // Zip -> Glow (2s) -> Open (Flash) -> Reveal
        setTimeout(() => setAnimationStage('glow'), 1500);
        setTimeout(() => setAnimationStage('open'), 3500);
        setTimeout(() => {
            setPullResults(results);
            setAnimationStage('reveal');
        }, 4000); // Flash duration
    };

    const handleDismiss = () => {
        setPullResults(null);
        setIsPulling(false);
        setAnimationStage('idle');
    };

    // Calculate Highest Rarity for Glow Color
    const maxRarity = pullResults ? Math.max(...pullResults.map(c => c.stars)) : 3;
    const glowColor = maxRarity === 6 ? 'text-orange-500 shadow-orange-500' :
        maxRarity === 5 ? 'text-yellow-400 shadow-yellow-400' :
            maxRarity === 4 ? 'text-purple-500 shadow-purple-500' : 'text-white shadow-white';
    const bgGlow = maxRarity === 6 ? 'bg-orange-500' : maxRarity === 5 ? 'bg-yellow-400' : maxRarity === 4 ? 'bg-purple-500' : 'bg-white';

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            {/* Stage: IDLE */}
            <AnimatePresence>
                {animationStage === 'idle' && (
                    <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-12">
                        {/* Recruitment Terminal Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-2"
                        >
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
                        </motion.div>

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

                                <div className="space-y-4 w-full">
                                    <div className="text-4xl font-bold text-white tabular-nums tracking-widest flex items-center justify-center gap-2">
                                        <Ticket className="w-6 h-6 text-tech-primary" />
                                        {state.headhuntTickets}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            onClick={() => handleSummon(1)}
                                            disabled={state.headhuntTickets < SUMMON_COST_SINGLE}
                                            size="lg"
                                            className="w-full relative group overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold">1x SCAN</span>
                                                <span className="text-[10px] font-mono opacity-60">{SUMMON_COST_SINGLE} TICKET</span>
                                            </div>
                                        </Button>

                                        <Button
                                            onClick={() => handleSummon(10)}
                                            disabled={state.headhuntTickets < SUMMON_COST_TEN}
                                            size="lg"
                                            className="w-full bg-orange-600/30 border-orange-500/50 hover:bg-orange-600/50 hover:border-orange-500 text-white"
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold flex items-center gap-1"><Sparkles size={14} /> 10x SCAN</span>
                                                <span className="text-[10px] font-mono opacity-60">{SUMMON_COST_TEN} TICKETS</span>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Stage: ANIMATION (Zip / Glow) */}
            <AnimatePresence>
                {(animationStage === 'zip' || animationStage === 'glow') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 to-black"></div>

                        {animationStage === 'zip' && (
                            <motion.div
                                animate={{ x: [-5, 5, -5, 5, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="relative"
                            >
                                <Briefcase size={120} strokeWidth={1} className="text-zinc-500" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center font-mono text-tech-primary text-xs tracking-widest animate-pulse">
                                    UNZIPPING...
                                </div>
                            </motion.div>
                        )}

                        {animationStage === 'glow' && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative"
                            >
                                {/* Bag with colored glow based on rarity */}
                                <Briefcase size={120} strokeWidth={1.5} className={`transition-all duration-500 ${glowColor} drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]`} />

                                {/* Light Beams */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-t from-transparent via-${bgGlow}/20 to-transparent clip-path-polygon-[50%_50%_0%_0%_100%_0%]`}
                                ></motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stage: FLASH */}
            <AnimatePresence>
                {animationStage === 'open' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-white pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Stage: REVEAL */}
            {animationStage === 'reveal' && pullResults && (
                <div className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-8">
                    {pullResults.length > 1 ? (
                        <div className="w-full max-w-6xl">
                            <div className="grid grid-cols-5 gap-4">
                                {pullResults.map((char, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: index * 0.15, type: 'spring' }}
                                        onClick={() => setRevealIndex(index)}
                                        className="aspect-[3/4] bg-zinc-900 border border-zinc-700 relative group cursor-pointer overflow-hidden hover:border-white transition-colors"
                                    >
                                        {/* Result Card Mini */}
                                        <img src={char.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-2">
                                            <div className={`text-center font-bold uppercase text-xs ${char.stars === 6 ? 'text-orange-500' : char.stars === 5 ? 'text-yellow-400' : 'text-white'}`}>
                                                {char.name}
                                            </div>
                                            <div className="flex justify-center">
                                                <StarDisplay count={char.stars} size={10} />
                                            </div>
                                        </div>

                                        {/* Flash Effect on Appear */}
                                        <motion.div
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: 0 }}
                                            transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
                                            className="absolute inset-0 bg-white pointer-events-none"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-center">
                                <Button onClick={handleDismiss} size="lg" className="w-64">
                                    CONFIRM RECRUITMENT
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            {/* Single Result Reveal */}
                            <ResultCard character={pullResults[0]} onDismiss={handleDismiss} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Re-using ResultCard with minor modifications for context if needed
const ResultCard = ({ character, onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-tech-surface border border-tech-border relative clip-angle overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
            <div className="absolute inset-0 opacity-40">
                <img src={character.image} className="w-full h-full object-cover grayscale mix-blend-luminosity group-hover:grayscale-0 transition-all duration-700Blur" />
                <div className="absolute inset-0 bg-gradient-to-r from-tech-surface via-tech-surface/90 to-transparent"></div>
            </div>

            <div className="relative z-10 grid grid-cols-[1fr_200px] gap-8 p-8 h-[400px]">
                <div className="flex flex-col justify-end items-start space-y-4">
                    <div className="bg-tech-primary text-black text-xs font-bold px-2 py-1 uppercase tracking-widest mb-2">
                        Authorization Approved
                    </div>
                    <h2 className="text-6xl font-bold uppercase tracking-tighter text-white/90">
                        {character.name}
                    </h2>
                    <StarDisplay count={character.stars} />

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs text-zinc-400 mt-4 border-t border-zinc-700 pt-4 w-full">
                        <div className="flex justify-between"><span>ATK</span><span className="text-white">{character.stats.attack}</span></div>
                        <div className="flex justify-between"><span>DEF</span><span className="text-white">{character.stats.defense}</span></div>
                    </div>

                    <div className="pt-8">
                        <Button variant="secondary" onClick={onDismiss} className="gap-2">
                            CONFIRM <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="relative h-full border-l border-white/10 pl-4 hidden md:block">
                    <img src={character.image} className="w-full h-full object-cover filter contrast-125 border border-white/10" />
                </div>
            </div>
        </motion.div>
    );
};
