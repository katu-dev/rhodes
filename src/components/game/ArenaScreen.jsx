import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { CHARACTERS } from '../../data/characters';
import { Button } from '../ui/Components';
import { motion } from 'framer-motion';
import { Zap, Crosshair, Users, Shield, Plus, Trophy, Sword } from 'lucide-react';
import { TeamSetupModal } from './TeamSetupModal';
import { BattleScreen } from './BattleScreen';

export const ArenaScreen = () => {
    const { state, dispatch, calculatePower } = useGame();
    const { token, user, updateUser } = useAuth();
    const [opponents, setOpponents] = useState([]);
    const [ladder, setLadder] = useState([]);
    const [viewMode, setViewMode] = useState('MATCHMAKING'); // 'MATCHMAKING' | 'LADDER'
    const [loading, setLoading] = useState(false);

    // Team State
    const [defenseSquad, setDefenseSquad] = useState([]); // IDs
    const [attackSquad, setAttackSquad] = useState([]);   // IDs
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [setupType, setSetupType] = useState('ATTACK');
    const [saving, setSaving] = useState(false);

    // Battle State
    const [activeBattle, setActiveBattle] = useState(null); // If set, show BattleScreen

    useEffect(() => {
        fetchOpponents();
        fetchMyTeams();
    }, []);

    const fetchMyTeams = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/pvp/my-teams', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                data.forEach(team => {
                    // Handle legacy (array) vs new (object with ids) format
                    const squadIds = Array.isArray(team.squad) ? team.squad : (team.squad?.ids || []);

                    if (team.type === 'ATTACK') setAttackSquad(squadIds);
                    if (team.type === 'DEFENSE') setDefenseSquad(squadIds);
                });
            }
        } catch (e) {
            console.error("Failed to fetch my teams", e);
        }
    };

    const fetchOpponents = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/pvp/opponents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setOpponents(data);
        } catch (e) {
            console.error("Failed to fetch opponents", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchLadder = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/pvp/ladder', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setLadder(data);
        } catch (e) {
            console.error("Failed to fetch ladder", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTeam = async (squadIds) => {
        setSaving(true);

        // Calculate Squad Power & Create Snapshot
        let squadPower = 0;
        const snapshot = squadIds.map(uid => {
            const char = state.inventory.find(c => c.uid === uid);
            if (!char) return null;
            const base = CHARACTERS.find(c => c.id === char.baseId);

            squadPower += calculatePower(char);

            // Snapshot data for enemy display
            return {
                ...char,
                name: base.name,
                image: base.image,
                hp: 100 * char.level, // Stats calculation (should match BattleScreen logic ideally)
                maxHp: 100 * char.level,
                atk: 10 * char.level,
                speed: 10
            };
        }).filter(Boolean);

        try {
            await fetch('http://localhost:3001/api/pvp/team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: setupType,
                    squad: { ids: squadIds, snapshot }, // New Format
                    power: squadPower
                })
            });

            // Refresh local teams to be sure
            await fetchMyTeams();
            await fetchOpponents(); // Update opponent list too if needed

            setIsSetupOpen(false);
        } catch (e) {
            console.error("Failed to save team", e);
            alert("Failed to save team. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const startBattle = (opponent) => {
        // Need a valid attack squad first
        if (attackSquad.length === 0) {
            alert("Please set up your ATTACK TEAM first!");
            return;
        }

        setActiveBattle(opponent);
    };

    const handleBattleEnd = async (result) => {
        // result is { winner: 'player' | 'enemy' }
        const isWin = result.winner === 'player';

        try {
            const res = await fetch('http://localhost:3001/api/pvp/result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    opponentId: activeBattle.userId,
                    result: isWin ? 'WIN' : 'LOSS'
                })
            });
            const data = await res.json();

            // Update local user state immediately
            updateUser({ elo: data.newElo });

            alert(`Battle Finished!\nELO Change: ${data.delta > 0 ? '+' : ''}${data.delta}\nCurrent ELO: ${data.newElo}`);
            fetchOpponents(); // Refresh list
        } catch (e) {
            console.error("Failed to report result", e);
        }

        setActiveBattle(null);
    };

    if (activeBattle) {
        // Reuse BattleScreen but with override props

        let enemyTeam = [];

        // CHECK FOR SNAPSHOT DATA
        if (activeBattle.squad && activeBattle.squad.snapshot) {
            enemyTeam = activeBattle.squad.snapshot.map((char, i) => ({
                ...char,
                id: `enemy-${i}`, // Override ID to avoid conflicts
                // Ensure stats are numbers
                hp: Number(char.hp),
                maxHp: Number(char.maxHp),
                atk: Number(char.atk),
                def: Number(char.def || 0),
                speed: Number(char.speed || 10)
            }));
        } else {
            // Fallback for ID-only squads (legacy)
            const squadIds = Array.isArray(activeBattle.squad) ? activeBattle.squad : (activeBattle.squad.ids || []);

            enemyTeam = squadIds.map((uid, i) => {
                return {
                    id: `enemy-${i}`,
                    name: `Unknown Operator`,
                    hp: 1000,
                    maxHp: 1000,
                    atk: 50,
                    def: 20,
                    speed: 10,
                    image: CHARACTERS[i % CHARACTERS.length].image // Random image fallback
                };
            });
        }

        // We also need to pass OUR attack squad
        // Construct player team from attackSquad IDs
        const playerTeam = attackSquad.map(uid => {
            const char = state.inventory.find(c => c.uid === uid);
            if (!char) return null;
            const base = CHARACTERS.find(c => c.id === char.baseId);
            return {
                ...char,
                name: base.name,
                image: base.image,
                hp: 100 * char.level, // Mock stats
                maxHp: 100 * char.level,
                atk: 10 * char.level,
                speed: 10
            };
        }).filter(Boolean);

        return (
            <BattleScreen
                isPvp={true}
                playerSquadOverride={playerTeam}
                enemySquadOverride={enemyTeam}
                onBattleEnd={handleBattleEnd}
            />
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 relative">
            {/* Header / Stats */}
            <div className="bg-tech-surface p-6 border border-tech-border clip-angle flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white italic">Competitive Arena</h1>
                    <p className="text-zinc-500 font-mono text-sm">SEASON 1 :: RANKING ONLINE</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-tech-primary font-bold uppercase">Current Rank</div>
                    <div className="text-4xl font-bold text-white tabular-nums flex items-center justify-end gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        {user?.elo || 1000}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Panel: My Setup */}
                <div className="bg-black/40 border border-tech-border p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-tech-border pb-2">
                        <span className="font-bold text-zinc-300">MY FORMATIONS</span>
                        <Shield className="w-4 h-4 text-zinc-500" />
                    </div>

                    {['ATTACK', 'DEFENSE'].map(type => (
                        <div key={type} className="bg-tech-surface/50 p-4 border border-zinc-800 hover:border-tech-primary transition-colors">
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-sm font-bold ${type === 'ATTACK' ? 'text-red-400' : 'text-blue-400'}`}>{type} SQUAD</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSetupType(type);
                                        setIsSetupOpen(true);
                                    }}
                                >
                                    EDIT
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                {(type === 'ATTACK' ? attackSquad : defenseSquad).map(uid => {
                                    const char = state.inventory.find(c => c.uid === uid);
                                    if (!char) return null;
                                    const base = CHARACTERS.find(c => c.id === char.baseId);

                                    return (
                                        <div key={uid} className="w-8 h-8 bg-black border border-zinc-700 relative group/icon">
                                            <img src={base.image} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/icon:opacity-100 flex items-center justify-center text-[8px] text-white font-bold">
                                                {base.name.substring(0, 3)}
                                            </div>
                                        </div>
                                    );
                                })}
                                {(type === 'ATTACK' ? attackSquad : defenseSquad).length === 0 && (
                                    <span className="text-xs text-zinc-600 italic">No operators assigned</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Opponent List */}
                {/* Right Panel: Opponent List / Ladder */}
                <div className="lg:col-span-2 overflow-y-auto bg-black/20 border border-tech-border p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4 border-b border-tech-border pb-2">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setViewMode('MATCHMAKING')}
                                className={`text-xl font-bold transition-colors ${viewMode === 'MATCHMAKING' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                MATCHMAKING
                            </button>
                            <button
                                onClick={() => { setViewMode('LADDER'); fetchLadder(); }}
                                className={`text-xl font-bold transition-colors ${viewMode === 'LADDER' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                LADDER
                            </button>
                        </div>
                        {viewMode === 'MATCHMAKING' && (
                            <Button onClick={fetchOpponents} disabled={loading} size="sm">REFRESH TARGETS</Button>
                        )}
                        {viewMode === 'LADDER' && (
                            <Button onClick={fetchLadder} disabled={loading} size="sm">REFRESH RANKINGS</Button>
                        )}
                    </div>

                    {loading && <div className="text-tech-primary font-mono animate-pulse mb-4">FETCHING DATA...</div>}

                    {viewMode === 'MATCHMAKING' ? (
                        <div className="space-y-3">
                            {opponents.map(opp => (
                                <div key={opp.userId} className="bg-zinc-900/80 border-l-4 border-l-red-500 p-4 flex justify-between items-center hover:bg-zinc-800 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-950 flex items-center justify-center text-red-700 font-bold text-xl">
                                            VS
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg">{opp.username}</div>
                                            <div className="text-xs text-zinc-500 font-mono">ELO: {opp.elo} // POWER: {opp.power}</div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => startBattle(opp)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Sword className="w-4 h-4 mr-2" />
                                        ENGAGE
                                    </Button>
                                </div>
                            ))}
                            {opponents.length === 0 && !loading && (
                                <div className="text-zinc-500 text-center py-8">NO TARGETS FOUND IN RANKS</div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Ladder Header */}
                            <div className="grid grid-cols-12 text-xs font-mono text-zinc-500 px-4 pb-2">
                                <div className="col-span-2">RANK</div>
                                <div className="col-span-7">OPERATOR</div>
                                <div className="col-span-3 text-right">ELO RATING</div>
                            </div>

                            {ladder.map((player, index) => (
                                <div key={player.id} className={`grid grid-cols-12 items-center p-3 border-b border-white/5 ${player.username === user.username ? 'bg-tech-primary/10 border-tech-primary/30' : 'hover:bg-white/5'}`}>
                                    <div className="col-span-2 font-bold text-lg text-white/50">#{index + 1}</div>
                                    <div className="col-span-7 font-bold text-white flex items-center gap-2">
                                        {index < 3 && <Trophy className={`w-4 h-4 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-400' : 'text-amber-700'}`} />}
                                        {player.username}
                                    </div>
                                    <div className="col-span-3 text-right font-mono text-tech-primary">{player.elo}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <TeamSetupModal
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                teamType={setupType}
                currentSquad={setupType === 'ATTACK' ? attackSquad : defenseSquad}
                onSave={handleSaveTeam}
                inventory={state.inventory}
                isSaving={saving}
            />
        </div>
    );
};
