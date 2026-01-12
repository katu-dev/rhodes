import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Package, Shield, Swords, Layers, Database } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../ui/Components';

export const InventoryScreen = () => {
    const { state } = useGame();
    const [activeTab, setActiveTab] = useState('equipment'); // equipment | materials

    const inventoryItems = state.items || [];

    // Filter items based on tab
    const displayedItems = inventoryItems.filter(item => {
        if (activeTab === 'equipment') return item.type === 'equipment';
        if (activeTab === 'materials') return item.type === 'material';
        return false;
    });

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-tech-border pb-4">
                <div>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter glitch-text" data-text="LOGISTICS">LOGISTICS</h2>
                    <p className="font-mono text-xs text-zinc-500">
                        DEPOT MANAGEMENT // TOTAL ITEMS: {inventoryItems.length}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <TabButton
                        active={activeTab === 'equipment'}
                        onClick={() => setActiveTab('equipment')}
                        icon={Box}
                        label="EQUIPMENT"
                    />
                    <TabButton
                        active={activeTab === 'materials'}
                        onClick={() => setActiveTab('materials')}
                        icon={Layers}
                        label="MATERIALS"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayedItems.length === 0 ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-zinc-600 font-mono border border-dashed border-zinc-800 bg-black/20">
                        <Package className="w-12 h-12 mb-4 opacity-20" />
                        NO {activeTab.toUpperCase()} FOUND
                    </div>
                ) : (
                    displayedItems.map((item) => (
                        <ItemCard key={item.uid} item={item} />
                    ))
                )}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase transition-all duration-200 clip-angle",
            active
                ? "bg-tech-primary/10 text-tech-primary border-tech-primary"
                : "bg-transparent text-zinc-500 border-transparent hover:border-zinc-700 hover:text-zinc-300"
        )}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const ItemCard = ({ item }) => {
    const isEquip = item.type === 'equipment';
    const isRare = item.rarity === 'rare' || item.rarity === 'epic';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={clsx(
                "relative bg-tech-surface border p-4 flex flex-col gap-3 group overflow-hidden transition-colors hover:border-tech-primary/50",
                isRare ? "border-tech-accent/30" : "border-tech-border"
            )}
        >
            {/* Header Icon */}
            <div className="flex justify-between items-start">
                <div className={clsx(
                    "w-8 h-8 flex items-center justify-center rounded-sm",
                    isRare ? "bg-tech-accent/10 text-tech-accent" : "bg-zinc-800 text-zinc-500"
                )}>
                    {isEquip ? (
                        item.slot === 'weapon' ? <Swords className="w-4 h-4" /> : <Shield className="w-4 h-4" />
                    ) : (
                        <Database className="w-4 h-4" />
                    )}
                </div>
                {item.count > 1 && (
                    <div className="px-1.5 py-0.5 bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                        x{item.count}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="font-bold text-xs uppercase tracking-wide text-zinc-200 group-hover:text-tech-primary transition-colors line-clamp-2">
                    {item.name}
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase">
                    {item.rarity} {isEquip ? item.slot : 'MATERIAL'}
                </p>
            </div>

            {/* Stats (for Equipment only) */}
            {isEquip && item.stats && (
                <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-dashed border-zinc-800">
                    {Object.entries(item.stats).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-[9px] font-mono text-zinc-400">
                            <span className="uppercase">{key.substring(0, 3)}</span>
                            <span className={val > 0 ? "text-tech-success" : "text-tech-error"}>{val > 0 ? '+' : ''}{val}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Description (for Materials) */}
            {!isEquip && item.description && (
                <div className="mt-2 text-[9px] text-zinc-600 line-clamp-3 leading-tight">
                    {item.description}
                </div>
            )}

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-tech-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </motion.div>
    );
};
