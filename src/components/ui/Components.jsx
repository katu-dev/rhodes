import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

/**
 * Tactical Button Component
 * Sharp edges, diagonal stripe hover, glitch text
 */
export const Button = ({ children, variant = 'primary', size = 'md', className, isLoading, disabled, ...props }) => {

    const variants = {
        primary: "bg-tech-primary text-black hover:bg-cyan-300 border-transparent",
        secondary: "bg-transparent border-tech-primary text-tech-primary hover:bg-tech-primary/10",
        danger: "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30",
        ghost: "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-6 py-2 text-sm",
        lg: "px-8 py-3 text-base"
    };

    return (
        <button
            className={clsx(
                "relative group overflow-hidden font-bold uppercase tracking-wider transition-all duration-200 clip-angle disabled:opacity-50 disabled:cursor-not-allowed border flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || disabled}
            {...props}
        >
            {/* Background Stripe Animation */}
            {variant === 'primary' && (
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDNIMHYxek0wIDJoMXYxSDB6TTEgMGgxdjFIMXoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjEiLz48L3N2Zz4=')] transition-transform duration-300 pointer-events-none" />
            )}

            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}

            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50"></div>
        </button>
    );
};

/**
 * Tactical Card Component
 * Glass background, tech border, header strip
 */
export const Card = ({ children, className, title, action }) => {
    return (
        <div className={clsx(
            "bg-tech-surface/60 border border-tech-border backdrop-blur-md relative",
            className
        )}>
            {/* Header Strip if Title exists */}
            {(title || action) && (
                <div className="flex items-center justify-between p-3 border-b border-tech-border bg-black/20">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-tech-primary"></div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-300">{title}</h3>
                    </div>
                    <div>{action}</div>
                </div>
            )}

            <div className="p-4 relative z-10">
                {children}
            </div>

            {/* Deco Elements */}
            <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-l border-t border-tech-primary pointer-events-none"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-r border-b border-tech-primary pointer-events-none"></div>
        </div>
    );
};

export const StarDisplay = ({ count, className }) => {
    // Tiers: 0=White, 1=Bronze, 2=Silver, 3=Gold, 4=Chromatic
    // Logic: Position i color depends on count check

    // Helper to get color class
    const getStarClass = (index) => {
        // Tiers require count > (tier * 5) + index
        if (count > 20 + index) return "bg-cyan-400 border-cyan-400 shadow-[0_0_8px_#22d3ee]"; // Chromatic
        if (count > 15 + index) return "bg-yellow-400 border-yellow-400 shadow-[0_0_5px_#facc15]"; // Gold
        if (count > 10 + index) return "bg-zinc-300 border-zinc-300 shadow-[0_0_5px_#d4d4d8]"; // Silver
        if (count > 5 + index) return "bg-amber-700 border-amber-700 shadow-[0_0_5px_#b45309]"; // Bronze
        if (count > index) return "bg-white border-white shadow-[0_0_5px_white]"; // White

        // Empty slot - Show "Previous Tier" as empty base? 
        // No, user said "displays like bronze then 4 white". 
        // This implies the "empty" spots should be the previous tier's color if we are mid-tier.
        // Wait, my logic above handles "filled" spots. 
        // If I am level 6 (1 Bronze), the checks above give:
        // i=0: Bronze.
        // i=1: White. 
        // This implicitly works because the higher tier condition failed, so it fell through to lower tier.
        // What if I am level 1? i=0: White. i=1: Empty.
        // Fallback for empty? Just transparent border.
        return "border-zinc-700 bg-transparent";
    };

    return (
        <div className={clsx("flex gap-1", className)}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className={clsx(
                        "w-3 h-3 rotate-45 border transition-colors duration-300",
                        getStarClass(i)
                    )}
                />
            ))}
        </div>
    );
};
