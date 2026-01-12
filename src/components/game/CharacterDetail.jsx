import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Swords, Heart, Zap, User, Box } from 'lucide-react';
import { Button } from '../ui/Components';
import { EQUIPMENT_SLOTS } from '../../data/items';
import clsx from 'clsx';
import { CHARACTERS } from '../../data/characters';
import { useGame } from '../../context/GameContext';

export const CharacterDetail = ({ charUid, onClose }) => {
    const { state, calculateStats, dispatch } = useGame();
    // selectedSlot state is defined below with logic, removing duplicate here

    // Find character data
    const charInstance = state.inventory.find(c => c.uid === charUid);
    if (!charInstance) return null;

    const baseData = CHARACTERS.find(c => c.id === charInstance.baseId);
    if (!baseData) return null;

    // Calculate final stats including equipment
    const stats = calculateStats(charInstance);

    const [selectedSlot, setSelectedSlot] = useState(null);

    // Filter items for the selected slot
    const availableItems = selectedSlot
        ? state.items.filter(item => item.type === 'equipment' && item.slot === selectedSlot)
        : [];

    const handleEquip = (item) => {
        dispatch({
            type: 'EQUIP_ITEM',
            payload: {
                charId: charUid,
                slot: selectedSlot,
                item: item
            }
        });
        setSelectedSlot(null);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                {/* Backdrop - Click to close everything */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
                    onClick={onClose}
                />

                <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
                    {/* Main Character Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, x: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            x: selectedSlot ? -200 : 0 // Shift left when slot selected
                        }}
                        exit={{ scale: 0.95, opacity: 0, x: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="w-full max-w-5xl bg-zinc-900 border border-tech-border relative overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px] shadow-2xl clip-angle-tr pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Character Art Panel (Left) */}
                        <div className="w-full md:w-1/3 relative bg-black shrink-0 border-r border-tech-border overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10"></div>
                            <img
                                src={baseData.image}
                                className="w-full h-full object-cover object-top opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                <h2 className="text-3xl font-bold uppercase tracking-tighter text-white glitch-text mb-1" data-text={baseData.name}>
                                    {baseData.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        "px-2 py-0.5 text-[10px] font-bold uppercase border",
                                        "border-tech-primary text-tech-primary bg-tech-primary/10"
                                    )}>
                                        {baseData.element}
                                    </span>
                                    <span className="text-zinc-500 font-mono text-xs">
                                        LV.{charInstance.stars} OPERATOR
                                    </span>
                                </div>
                            </div>

                            {/* Rarity Stars */}
                            <div className="absolute top-4 left-4 z-20 flex gap-0.5">
                                {Array.from({ length: charInstance.stars }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 bg-yellow-400 rotate-45 transform"></div>
                                ))}
                            </div>
                        </div>

                        {/* Data Panel (Right) */}
                        <div className="flex-1 flex flex-col min-h-0 bg-tech-surface relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-red-500 hover:text-white border-b border-l border-tech-border transition-colors z-30 text-zinc-400"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="p-6 border-b border-tech-border bg-black/20">
                                <div className="flex items-center gap-2 text-tech-accent text-xs font-mono uppercase tracking-widest mb-4">
                                    <Box className="w-4 h-4" />
                                    <span>Combat Data</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatBox icon={Swords} label="ATK" value={stats.attack} base={baseData.stats.attack} />
                                    <StatBox icon={Shield} label="DEF" value={stats.defense} base={baseData.stats.defense} />
                                    <StatBox icon={Heart} label="HP" value={stats.health} base={baseData.stats.health} />
                                    <StatBox icon={Zap} label="SPD" value={stats.speed} base={baseData.stats.speed} />
                                </div>
                            </div>

                            {/* Equipment Grid */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest mb-4">
                                    <User className="w-4 h-4" />
                                    <span>Equipment Loadout</span>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {EQUIPMENT_SLOTS.map((slot) => {
                                        const equippedItem = charInstance.equipment?.[slot];
                                        const isSelected = selectedSlot === slot;

                                        return (
                                            <div
                                                key={slot}
                                                onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                                className={clsx(
                                                    "aspect-square border bg-black/40 transition-all relative group cursor-pointer",
                                                    isSelected
                                                        ? "border-tech-primary shadow-[0_0_15px_rgba(0,255,157,0.3)] bg-tech-primary/5"
                                                        : "border-zinc-800 hover:border-tech-primary/50"
                                                )}
                                            >
                                                <div className="absolute top-2 left-2 text-[10px] uppercase text-zinc-600 font-bold tracking-wider">
                                                    {slot}
                                                </div>

                                                {equippedItem ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                                        <div className="w-12 h-12 bg-tech-primary/10 rounded-full flex items-center justify-center mb-2 animate-pulse">
                                                            <Box className="w-6 h-6 text-tech-primary" />
                                                        </div>
                                                        <span className="text-xs font-bold text-zinc-300">{equippedItem.name}</span>
                                                        <span className="text-[9px] text-zinc-500 mt-1 font-mono">RARE</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                                                        <Plusiccon className="w-8 h-8 opacity-20" />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-tech-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-tech-border bg-black/40 flex justify-end gap-2">
                                <Button variant="outline" onClick={onClose}>CLOSE DOSSIER</Button>
                                {/* <Button variant="primary">UPGRADE</Button> */}
                            </div>
                        </div>
                    </motion.div>

                    {/* Item Selection Panel (Animated In) */}
                    <AnimatePresence>
                        {selectedSlot && (
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                transition={{ delay: 0.1, type: "spring", bounce: 0 }}
                                className="absolute right-[10%] top-1/2 -translate-y-1/2 h-[500px] w-80 bg-zinc-900/95 backdrop-blur-xl border border-tech-border shadow-2xl z-50 flex flex-col pointer-events-auto"
                                style={{ transform: 'translateX(calc(50% + 20px))' }} // Position relative to shifted modal
                            >
                                <div className="p-4 border-b border-tech-border flex justify-between items-center bg-black/40">
                                    <div>
                                        <h3 className="font-bold text-white tracking-widest uppercase text-sm">Select {selectedSlot}</h3>
                                        <p className="text-[10px] text-zinc-500 font-mono">AVAILABLE: {availableItems.length}</p>
                                    </div>
                                    <button onClick={() => setSelectedSlot(null)} className="text-zinc-500 hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {availableItems.length === 0 ? (
                                        <div className="text-center py-8 text-zinc-600 font-mono text-xs border border-dashed border-zinc-800">
                                            NO ITEMS FOUND
                                        </div>
                                    ) : (
                                        availableItems.map(item => (
                                            <div
                                                key={item.uid}
                                                onClick={() => handleEquip(item)}
                                                className="p-3 border border-zinc-800 bg-black/20 hover:bg-tech-primary/10 hover:border-tech-primary/30 cursor-pointer group transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-zinc-300 text-xs group-hover:text-white">{item.name}</span>
                                                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{item.rarity}</span>
                                                </div>
                                                <div className="flex gap-2 text-[9px] font-mono text-zinc-400">
                                                    {Object.entries(item.stats).map(([k, v]) => (
                                                        <span key={k}>{k.toUpperCase().substring(0, 3)} +{v}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AnimatePresence>
    );
};

const StatBox = ({ icon: Icon, label, value, base }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 p-3 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-[10px] text-zinc-500 font-bold">{label}</span>
            <Icon className="w-3 h-3 text-zinc-600 group-hover:text-tech-primary transition-colors" />
        </div>
        <div className="text-2xl font-bold text-white relative z-10">{value}</div>
        <div className="text-[9px] text-zinc-600 font-mono relative z-10">BASE: {base}</div>

        <div className="absolute right-0 bottom-0 w-12 h-12 bg-zinc-800/20 rounded-tl-3xl -mr-6 -mb-6 group-hover:bg-tech-primary/10 transition-colors"></div>
    </div>
);

const Plusiccon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M12 6v12M6 12h12" />
    </svg>
);
