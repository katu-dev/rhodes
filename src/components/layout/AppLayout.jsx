import React from 'react';
import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';
import { Home, Users, Sword, Menu, Activity, User, Zap, Package } from 'lucide-react';
import clsx from 'clsx';

// Navigation Items
const NAV_ITEMS = [
    { id: 'summon', label: 'RECRUIT', icon: Users },
    { id: 'roster', label: 'OPERATORS', icon: User },
    { id: 'arena', label: 'MISSIONS', icon: Sword },
    { id: 'depot', label: 'DEPOT', icon: Package },
];

export const AppLayout = ({ children, currentTab, onTabChange }) => {
    const { state } = useGame();

    return (
        <div className="h-screen w-screen bg-tech-bg text-zinc-100 flex overflow-hidden font-display bg-tech-grid relative">

            {/* Ambient Noise / Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

            {/* Sidebar (Desktop) */}
            <aside className="w-20 md:w-64 border-r border-tech-border bg-tech-surface/90 backdrop-blur-md z-10 flex flex-col">
                <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-tech-border">
                    <Activity className="w-8 h-8 text-tech-primary" />
                    <span className="hidden md:block ml-3 font-bold text-xl tracking-widest uppercase">RHODES</span>
                </div>

                <nav className="flex-1 py-6 space-y-2 px-2">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={clsx(
                                "w-full flex items-center p-3 transition-all duration-200 group relative overflow-hidden clip-angle",
                                currentTab === item.id
                                    ? "bg-tech-primary/10 text-tech-primary border-r-2 border-tech-primary"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-6 h-6 shrink-0" />
                            <span className="hidden md:block ml-4 font-bold tracking-wider text-sm">{item.label}</span>

                            {/* Hover Glitch Effect Element */}
                            {currentTab === item.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-tech-primary shadow-[0_0_10px_currentColor]"></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-tech-border text-xs text-zinc-500 text-center md:text-left font-mono">
                    <p>VER 0.8.2.1</p>
                    <p className="hidden md:block">SYS: ONLINE</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
                {/* Header HUD */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-tech-border bg-tech-surface/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="font-mono text-sm text-zinc-400">CONNECTED</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Currency Display */}
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 border border-tech-border clip-angle-inv">
                            <Zap className="w-4 h-4 text-tech-accent" />
                            <span className="font-mono font-bold text-xl tracking-widest text-tech-accent">
                                {state.currency.toLocaleString()}
                            </span>
                            <span className="text-xs text-zinc-500 font-bold">LMD</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
                    {/* Decorative Corner Lines */}
                    <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-zinc-800/50 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-zinc-800/50 pointer-events-none"></div>

                    {children}
                </div>
            </main>
        </div>
    );
};
