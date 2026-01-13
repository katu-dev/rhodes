
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Zap } from 'lucide-react';

export function LoginScreen({ onRegisterClick }) {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login({ username: data.username, id: data.userId }, data.token);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-tech-bg relative overflow-hidden font-display">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none"></div>

            <div className="w-full max-w-md bg-tech-surface border border-tech-border p-8 clip-angle relative z-10">
                <div className="mb-8 text-center">
                    <Shield className="w-12 h-12 text-tech-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white glitch-text" data-text="RHODES OS">RHODES OS</h1>
                    <p className="text-tech-primary font-mono text-sm mt-2">SECURE ACCESS TERMINAL</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 mb-6 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Operator ID</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-tech-border p-3 text-white focus:border-tech-primary focus:outline-none transition-colors"
                            placeholder="Enter Username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Passcode</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-tech-border p-3 text-white focus:border-tech-primary focus:outline-none transition-colors"
                            placeholder="Enter Password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-tech-primary text-black font-bold py-3 uppercase tracking-widest hover:bg-cyan-300 transition-colors disabled:opacity-50 clip-angle-inv"
                    >
                        {loading ? 'Authenticating...' : 'Connect'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={onRegisterClick}
                        className="text-zinc-500 hover:text-white text-xs uppercase tracking-wide underline decoration-dotted"
                    >
                        Register New Account
                    </button>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 text-[10px] text-zinc-700 font-mono">
                V.2.0.4.5 :: SYSTEM ONLINE
            </div>
        </div>
    );
}
