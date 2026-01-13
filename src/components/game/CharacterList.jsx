import { useGame } from '../../context/GameContext';
import { CHARACTERS } from '../../data/characters';
import { Button, Card, StarDisplay } from '../ui/Components';
import { motion } from 'framer-motion';
import { Shield, Swords, Heart, Zap, User, Star } from 'lucide-react';
import clsx from 'clsx';
import { CharacterDetail } from './CharacterDetail';
import { useState } from 'react';

export const CharacterList = () => {
    const { state } = useGame();
    const [selectedCharUid, setSelectedCharUid] = useState(null);

    // Group inventory by basic sorting
    const inventory = state.inventory;

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-tech-border pb-4">
                <div>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter glitch-text" data-text="PERSONNEL">PERSONNEL</h2>
                    <p className="font-mono text-xs text-zinc-500">
                        REGISTERED OPERATORS: {inventory.length} // MAX: 50
                    </p>
                </div>

                <div className="flex gap-2">
                    {/* Pseudo Filters */}
                    <span className="px-3 py-1 bg-tech-primary/10 text-tech-primary border border-tech-primary text-xs font-bold uppercase">ALL</span>
                    <span className="px-3 py-1 bg-transparent text-zinc-500 border border-transparent hover:border-zinc-700 text-xs font-bold uppercase cursor-pointer">VANGUARD</span>
                    <span className="px-3 py-1 bg-transparent text-zinc-500 border border-transparent hover:border-zinc-700 text-xs font-bold uppercase cursor-pointer">GUARD</span>
                </div>
            </div>

            {/* Roster Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {inventory.length === 0 ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-zinc-600 font-mono border border-dashed border-zinc-800 bg-black/20">
                        <User className="w-12 h-12 mb-4 opacity-20" />
                        NO OPERATORS ASSIGNED
                    </div>
                ) : (
                    inventory.map((char) => {
                        const baseData = CHARACTERS.find(c => c.id === char.baseId);
                        if (!baseData) return null; // Skip invalid characters

                        return (
                            <motion.div
                                key={char.uid}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -2 }}
                                onClick={() => setSelectedCharUid(char.uid)}
                                className="group relative bg-tech-surface border border-tech-border overflow-hidden clip-angle-inv h-32 flex cursor-pointer"
                            >
                                {/* Portrait Side */}
                                <div className="w-24 relative overflow-hidden bg-zinc-900 border-r border-tech-border shrink-0">
                                    <img
                                        src={baseData.image}
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-110 group-hover:scale-125"
                                    />
                                    <div className="absolute top-1 left-1 bg-black/80 text-[10px] font-bold px-1 text-white border border-white/10 flex items-center gap-1">
                                        <span>LV.{char.level || 1}</span>
                                        <div className="flex items-center text-yellow-400">
                                            <Star size={8} fill="currentColor" />
                                            <span className="ml-0.5">{char.stars}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Side */}
                                <div className="flex-1 p-3 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-sm uppercase tracking-wide text-white group-hover:text-tech-primary transition-colors truncate">
                                                {baseData.name}
                                            </h3>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 font-mono uppercase mt-1">
                                            {baseData.element} CLASS
                                        </div>
                                    </div>

                                    {/* Mini Stats */}
                                    <div className="grid grid-cols-2 gap-1 mt-2">
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                            <Swords className="w-3 h-3 text-zinc-600" />
                                            <span>{char.stats.attack}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                            <Heart className="w-3 h-3 text-zinc-600" />
                                            <span>{char.stats.health}</span>
                                        </div>
                                    </div>

                                    {/* Deco ID */}
                                    <div className="absolute right-2 bottom-2 text-[8px] font-mono text-zinc-700 select-none group-hover:text-tech-primary/50">
                                        #{char.uid.substring(0, 6).toUpperCase()}
                                    </div>
                                </div>

                                {/* Hover Tech Overlay */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-tech-primary/30 pointer-events-none transition-all duration-300"></div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {selectedCharUid && (
                <CharacterDetail
                    charUid={selectedCharUid}
                    onClose={() => setSelectedCharUid(null)}
                />
            )}
        </div>
    );
};
