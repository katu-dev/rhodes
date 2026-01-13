import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS } from '../../data/characters';
import { Button } from '../ui/Components';

export const TeamSetupModal = ({ isOpen, onClose, teamType, currentSquad, onSave, inventory, isSaving }) => {
    const [selectedSquad, setSelectedSquad] = React.useState(currentSquad || []);

    React.useEffect(() => {
        setSelectedSquad(currentSquad || []);
    }, [currentSquad, isOpen]);

    const toggleChar = (uid) => {
        if (selectedSquad.includes(uid)) {
            setSelectedSquad(prev => prev.filter(id => id !== uid));
        } else {
            if (selectedSquad.length < 4) {
                setSelectedSquad(prev => [...prev, uid]);
            }
        }
    };

    const handleSave = () => {
        onSave(selectedSquad);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl bg-tech-surface border border-tech-border clip-angle flex flex-col max-h-[90vh]"
            >
                <div className="p-4 border-b border-tech-border flex justify-between items-center bg-black/20">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-white">
                        <span className={teamType === 'ATTACK' ? 'text-red-500' : 'text-blue-500'}>{teamType}</span> TEAM SETUP
                    </h2>
                    <div className="text-zinc-500 font-mono text-sm">{selectedSquad.length}/4 OPERATORS</div>
                </div>

                <div className="flex-1 overflow-auto p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {inventory.map(char => {
                        const base = CHARACTERS.find(c => c.id === char.baseId);
                        if (!base) return null;
                        const isSelected = selectedSquad.includes(char.uid);

                        return (
                            <button
                                key={char.uid}
                                onClick={() => toggleChar(char.uid)}
                                className={`relative aspect-[3/4] border ${isSelected ? 'border-tech-primary' : 'border-zinc-800'} group overflow-hidden`}
                            >
                                <img src={base.image} className={`w-full h-full object-cover transition-all ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-tech-primary/20 flex items-center justify-center">
                                        <div className="bg-black/80 text-tech-primary text-xs font-bold px-2 py-1 uppercase">Selected</div>
                                    </div>
                                )}
                                <div className="absolute bottom-0 w-full bg-black/80 text-white text-[10px] font-bold p-1 truncate">
                                    {base.name}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-tech-border flex justify-end gap-3 bg-black/20">
                    <Button onClick={onClose} variant="secondary" disabled={isSaving}>CANCEL</Button>
                    <Button onClick={handleSave} disabled={selectedSquad.length === 0 || isSaving}>
                        {isSaving ? 'SAVING...' : 'UPDATE SQUAD'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
