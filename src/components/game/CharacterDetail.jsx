import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Swords, Heart, Zap, User, Box, Activity, Sparkles } from 'lucide-react';
import { Button, StarDisplay } from '../ui/Components';
import { EQUIPMENT_SLOTS } from '../../data/items';
import clsx from 'clsx';
import { CHARACTERS, MAX_LEVEL } from '../../data/characters';
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
    const [showFullStats, setShowFullStats] = useState(false);
    const [showEquipment, setShowEquipment] = useState(false);

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
                            x: (selectedSlot || showEquipment) ? -200 : 0 // Shift left when sub-modal open
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
                                        LV.{charInstance.level || 1} OPERATOR
                                    </span>
                                </div>
                            </div>

                            {/* Rarity Stars */}
                            <div className="absolute top-4 left-4 z-20">
                                <StarDisplay count={charInstance.stars} />
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

                            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative">
                                <div className="p-4 border-b border-tech-border bg-black/20">
                                    <div className="flex items-center gap-2 text-tech-accent text-xs font-mono uppercase tracking-widest mb-2">
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

                                {/* Skills Section */}
                                {baseData.skills && (
                                    <div className="p-4 border-b border-tech-border bg-black/10">
                                        <div className="flex items-center gap-2 text-tech-primary text-xs font-mono uppercase tracking-widest mb-2">
                                            <Sparkles className="w-4 h-4" />
                                            <span>Operator Skills</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <SkillCard skill={baseData.skills.passive} />
                                            <SkillCard skill={baseData.skills.skill1} label="Skill 1" />
                                            <SkillCard skill={baseData.skills.skill2} label="Skill 2" />
                                        </div>
                                    </div>
                                )}

                                {/* Equipment Action */}
                                <div className="p-4">
                                    <div className="bg-black/20 border border-zinc-800 px-4 py-2 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
                                        <div className="flex -space-x-2">
                                            {Object.values(charInstance.equipment || {}).map((item, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-lg relative group/icon">
                                                    <Box size={12} className="text-zinc-500 group-hover/icon:text-white" />
                                                </div>
                                            ))}
                                            {(!charInstance.equipment || Object.keys(charInstance.equipment).length === 0) && (
                                                <div className="text-zinc-600 text-[10px] italic">Empty Slot</div>
                                            )}
                                        </div>
                                        <div>
                                            <Button size="sm" variant="outline" className="text-[10px] h-8 px-3" onClick={() => setShowEquipment(true)}>
                                                EDIT LOADOUT
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions / Level Up */}
                            <div className="p-4 border-t border-tech-border bg-black/40 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm font-mono text-zinc-400">
                                    {/* Full Stats Modal Overlay */}
                                    <AnimatePresence>
                                        {showFullStats && (
                                            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.9, opacity: 0 }}
                                                    className="w-full max-w-sm bg-zinc-900 border border-tech-primary/30 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative clip-angle flex flex-col"
                                                >
                                                    <div className="p-4 border-b border-tech-border flex justify-between items-center bg-black/40">
                                                        <h3 className="font-bold text-white tracking-widest uppercase text-sm flex items-center gap-2">
                                                            <Activity size={14} className="text-tech-primary" />
                                                            Combat Parameters
                                                        </h3>
                                                        <button onClick={() => setShowFullStats(false)} className="text-zinc-500 hover:text-white">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="p-6 space-y-6 bg-tech-surface/90">
                                                        {/* Primary Stats */}
                                                        <div>
                                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 border-b border-zinc-800 pb-1">Primary Attributes</div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <StatRow label="ATTACK" value={stats.attack} icon={Swords} />
                                                                <StatRow label="DEFENSE" value={stats.defense} icon={Shield} />
                                                                <StatRow label="HEALTH" value={stats.health} icon={Heart} />
                                                                <StatRow label="SPEED" value={stats.speed} icon={Zap} />
                                                            </div>
                                                        </div>

                                                        {/* Advanced Stats */}
                                                        <div>
                                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 border-b border-zinc-800 pb-1">Combat Potency</div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <StatRow label="CRIT RATE" value={`${stats.critRate}%`} highlight={stats.critRate > 5} />
                                                                <StatRow label="CRIT DMG" value={`${stats.critDmg}%`} highlight={stats.critDmg > 150} />
                                                                <StatRow label="DEF PEN" value={`${stats.defPen}%`} highlight={stats.defPen > 0} color="text-tech-accent" />
                                                                <StatRow label="REGEN" value={`${stats.regen}/T`} highlight={stats.regen > 0} color="text-green-500" />
                                                            </div>
                                                        </div>

                                                        {/* Evasion & Counters */}
                                                        <div>
                                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 border-b border-zinc-800 pb-1">Tactical Maneuvers</div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <StatRow label="EVASION" value={`${stats.evasion}%`} highlight={stats.evasion > 0} />
                                                                <StatRow label="DOUBLE HIT" value={`${stats.doubleHit}%`} highlight={stats.doubleHit > 0} />
                                                                <StatRow label="COUNTER" value={`${stats.counterRate}%`} highlight={stats.counterRate > 0} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {/* Leveling Interface */}
                                <div className="flex items-center justify-between bg-zinc-900/50 p-3 border border-zinc-800">
                                    <div className="flex flex-col">
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Current Level</div>
                                        <div className="text-2xl font-bold text-white font-mono">
                                            LV.{charInstance.level || 1}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Cost Display */}
                                        <div className="flex flex-col items-end text-right">
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Upgrade Cost</div>
                                            <div className="flex items-center gap-2">
                                                {/* Gold Cost */}
                                                <span className={clsx(
                                                    "font-mono text-sm",
                                                    state.currency >= ((charInstance.level || 1) * 100) ? "text-yellow-500" : "text-red-500"
                                                )}>
                                                    {(charInstance.level || 1) * 100} G
                                                </span>

                                                {/* Material Cost (if Breakthrough) */}
                                                {((charInstance.level || 1) % 10 === 9) && (
                                                    <span className={clsx(
                                                        "font-mono text-sm flex items-center gap-1",
                                                        // Check if we have the mat?
                                                        // This is a bit dirty inline, but effectively checks count
                                                        "text-white"
                                                    )}>
                                                        + <span className="text-cyan-400">{Math.ceil((charInstance.level || 1) / 10)}x Rec.</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="primary"
                                            onClick={() => dispatch({ type: 'LEVEL_UP', payload: { charId: charUid } })}
                                            disabled={
                                                (charInstance.level || 1) >= MAX_LEVEL ||
                                                state.currency < ((charInstance.level || 1) * 100) ||
                                                (((charInstance.level || 1) % 10 === 9) && !state.items.find(i => i.id === 'mat_battle_record_1' && i.count >= Math.ceil((charInstance.level || 1) / 10)))
                                            }
                                        >
                                            {(charInstance.level || 1) >= MAX_LEVEL ? "MAX LEVEL" : ((charInstance.level || 1) % 10 === 9) ? "PROMOTE" : "LEVEL UP"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowFullStats(true)}
                                        className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-tech-primary transition-colors flex items-center gap-1 border border-zinc-800 hover:border-tech-primary/50"
                                    >
                                        FULL DATA
                                        <Activity size={10} />
                                    </button>
                                    <Button variant="outline" onClick={onClose} size="sm">CLOSE DOSSIER</Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Equipment Management Modal */}
                    <AnimatePresence>
                        {showEquipment && (
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1, scale: selectedSlot ? 0.95 : 1, x: selectedSlot ? -50 : 0 }}
                                exit={{ x: 100, opacity: 0 }}
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                className="absolute right-[15%] top-1/2 -translate-y-1/2 h-[550px] w-[500px] bg-zinc-900/95 backdrop-blur-xl border border-tech-border shadow-2xl z-40 flex flex-col pointer-events-auto clip-angle"
                            >
                                <div className="p-5 border-b border-tech-border bg-black/40 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <User className="text-tech-primary" size={18} />
                                        <h3 className="font-bold text-white tracking-widest uppercase text-lg">Loadout Config</h3>
                                    </div>
                                    <button onClick={() => { setShowEquipment(false); setSelectedSlot(null); }} className="text-zinc-500 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto bg-black/20 flex-1 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-4">
                                        {EQUIPMENT_SLOTS.map((slot) => {
                                            const equippedItem = charInstance.equipment?.[slot];
                                            const isSelected = selectedSlot === slot;

                                            return (
                                                <div
                                                    key={slot}
                                                    onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                                    className={clsx(
                                                        "aspect-square border bg-black/40 transition-all relative group cursor-pointer flex flex-col items-center justify-center p-4",
                                                        isSelected
                                                            ? "border-tech-primary shadow-[0_0_15px_rgba(0,255,157,0.3)] bg-tech-primary/5"
                                                            : "border-zinc-800 hover:border-tech-primary/50"
                                                    )}
                                                >
                                                    <div className="absolute top-2 left-2 text-[10px] uppercase text-zinc-600 font-bold tracking-wider">
                                                        {slot}
                                                    </div>

                                                    {equippedItem ? (
                                                        <>
                                                            <div className="w-16 h-16 bg-tech-primary/10 rounded-lg border border-tech-primary/30 flex items-center justify-center mb-2 animate-pulse transition-transform group-hover:scale-110">
                                                                <Box className="w-8 h-8 text-tech-primary" />
                                                            </div>
                                                            <span className="text-xs font-bold text-zinc-300 group-hover:text-white">{equippedItem.name}</span>
                                                            <span className="text-[9px] text-zinc-500 mt-1 font-mono">{equippedItem.rarity || 'COMMON'}</span>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-800 group-hover:text-zinc-600 transition-colors">
                                                            <Plusiccon className="w-10 h-10 opacity-20" />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-tech-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                                        availableItems.map(item => {
                                            const owner = item.equippedBy ? state.inventory.find(c => c.uid === item.equippedBy) : null;
                                            const ownerName = owner ? CHARACTERS.find(c => c.id === owner.baseId)?.name : null;

                                            return (
                                                <div
                                                    key={item.uid}
                                                    onClick={() => handleEquip(item)}
                                                    className="p-3 border border-zinc-800 bg-black/20 hover:bg-tech-primary/10 hover:border-tech-primary/30 cursor-pointer group transition-all relative"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-zinc-300 text-xs group-hover:text-white">
                                                            {item.name} {(item.level || 0) > 0 && <span className="text-tech-primary">+{item.level}</span>}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{item.rarity}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 mb-1">
                                                        <div className="flex flex-wrap gap-2 text-[9px] font-mono text-zinc-400">
                                                            {Object.entries(item.stats).map(([k, v]) => (
                                                                <span key={k}>
                                                                    {k.toUpperCase().substring(0, 3)} +{Math.floor(v * (1 + (item.level || 0) * 0.1))}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {/* Substats */}
                                                        {item.substats && item.substats.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-tech-accent border-t border-zinc-800/50 pt-0.5 mt-0.5">
                                                                {item.substats.map((sub, idx) => (
                                                                    <span key={`sub-${idx}`} className="flex items-center gap-0.5">
                                                                        <span className="w-1 h-1 rounded-full bg-tech-accent"></span>
                                                                        {sub.stat.toUpperCase().substring(0, 3)} +{sub.value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {ownerName && (
                                                        <div className="text-[10px] text-yellow-500 font-mono flex items-center gap-1 bg-yellow-500/10 p-1 px-2 w-fit rounded-sm border border-yellow-500/20">
                                                            <User size={10} />
                                                            <span>USED BY {ownerName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
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

const StatRow = ({ label, value, icon: Icon, highlight, color = "text-white" }) => (
    <div className="flex justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-500">
            {Icon && <Icon size={12} />}
            <span>{label}</span>
        </div>
        <span className={clsx("font-bold", highlight ? "text-tech-primary" : color)}>
            {value}
        </span>
    </div>
);

const SkillCard = ({ skill, label }) => {
    if (!skill) return null;
    return (
        <div className="bg-zinc-900 border border-zinc-800 p-3 h-full flex flex-col relative group hover:border-tech-primary/50 transition-colors">
            {label && (
                <div className="absolute top-2 right-2 text-[9px] font-mono text-zinc-600 uppercase font-bold text-right leading-none">
                    {label}
                </div>
            )}
            <div className="text-xs font-bold text-white mb-1 group-hover:text-tech-primary transition-colors">{skill.name}</div>
            <div className="text-[10px] text-zinc-400 leading-tight mb-2 flex-1">{skill.description}</div>

            <div className="flex gap-2 text-[9px] font-mono text-zinc-600 uppercase border-t border-zinc-800 pt-2 mt-auto">
                <span className={clsx(skill.type === 'passive' ? 'text-tech-accent' : 'text-blue-400')}>
                    {skill.type}
                </span>
                {skill.spCost > 0 && <span>SP: {skill.spCost}</span>}
                {skill.cooldown > 0 && <span>CD: {skill.cooldown}</span>}
            </div>
        </div>
    );
};
