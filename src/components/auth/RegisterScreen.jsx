
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Shield } from 'lucide-react';

export function RegisterScreen({ onLoginClick }) {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login({ username: data.username, id: data.userId }, data.token);
            } else {
                setError(data.error || 'Registration failed');
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
                    <UserPlus className="w-12 h-12 text-tech-accent mx-auto mb-4" />
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">New Operator</h1>
                    <p className="text-tech-accent font-mono text-sm mt-2">PERSONNEL REGISTRATION</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 mb-6 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Codename (Username)</label>
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
                            placeholder="Create Password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Confirm Passcode</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-black/50 border border-tech-border p-3 text-white focus:border-tech-primary focus:outline-none transition-colors"
                            placeholder="Confirm Password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-tech-accent text-black font-bold py-3 uppercase tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-50 clip-angle-inv"
                    >
                        {loading ? 'Registering...' : 'Submit Profile'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={onLoginClick}
                        className="text-zinc-500 hover:text-white text-xs uppercase tracking-wide underline decoration-dotted"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
