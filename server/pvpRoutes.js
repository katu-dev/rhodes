
// PVP ROUTES

export function setupPvpRoutes(app, db, authenticateToken) {

    // GET My Teams
    app.get('/api/pvp/my-teams', authenticateToken, async (req, res) => {
        try {
            const teams = await db.all('SELECT type, squad_json FROM pvp_teams WHERE user_id = ?', req.user.id);
            res.json(teams.map(t => ({
                type: t.type,
                squad: JSON.parse(t.squad_json)
            })));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // GET Ladder (Top 50)
    app.get('/api/pvp/ladder', authenticateToken, async (req, res) => {
        try {
            const ladder = await db.all(`
                SELECT username, elo, id
                FROM users
                ORDER BY elo DESC
                LIMIT 50
            `);
            res.json(ladder);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // GET Opponents (Matchmaking)
    app.get('/api/pvp/opponents', authenticateToken, async (req, res) => {
        try {
            // Find users with similar ELO, excluding self
            // Naive implementation: get random 5 users
            const opponents = await db.all(`
                SELECT u.id, u.username, u.elo, p.power, p.squad_json 
                FROM users u
                JOIN pvp_teams p ON u.id = p.user_id 
                WHERE u.id != ? AND p.type = 'DEFENSE'
                ORDER BY RANDOM() LIMIT 5
            `, req.user.id);

            // Parse JSON squad for frontend
            const formatted = opponents.map(o => ({
                userId: o.id,
                username: o.username,
                elo: o.elo,
                power: o.power,
                squad: JSON.parse(o.squad_json)
            }));

            res.json(formatted);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // POST Save Team (Attack/Defense)
    app.post('/api/pvp/team', authenticateToken, async (req, res) => {
        const { type, squad, power } = req.body; // squad is array of stats/ids

        if (!['ATTACK', 'DEFENSE'].includes(type)) {
            return res.status(400).json({ error: 'Invalid team type' });
        }

        try {
            await db.run(`
                INSERT INTO pvp_teams (user_id, type, squad_json, power, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, type) DO UPDATE SET
                squad_json = excluded.squad_json,
                power = excluded.power,
                updated_at = CURRENT_TIMESTAMP
            `, req.user.id, type, JSON.stringify(squad), power);

            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // POST Match Result (ELO update)
    app.post('/api/pvp/result', authenticateToken, async (req, res) => {
        const { opponentId, result } = req.body; // result: 'WIN' or 'LOSS'

        try {
            const player = await db.get('SELECT elo FROM users WHERE id = ?', req.user.id);
            const opponent = await db.get('SELECT elo FROM users WHERE id = ?', opponentId);

            if (!opponent) return res.status(404).json({ error: 'Opponent not found' });

            // ELO Calculation (Simplified K-factor)
            const K = 32;
            const expectedScorePlayer = 1 / (1 + Math.pow(10, (opponent.elo - player.elo) / 400));
            const actualScore = result === 'WIN' ? 1 : 0;

            const newEloPlayer = Math.round(player.elo + K * (actualScore - expectedScorePlayer));

            // Note: In real PVP, opponent ELO should also update, but async or strict
            // For now, only update player ELO to avoid concurrent locking issues on simple DB
            // Or update both? Let's update both for realism.

            const expectedScoreOpponent = 1 / (1 + Math.pow(10, (player.elo - opponent.elo) / 400));
            const newEloOpponent = Math.round(opponent.elo + K * ((1 - actualScore) - expectedScoreOpponent));

            await db.run('UPDATE users SET elo = ? WHERE id = ?', newEloPlayer, req.user.id);
            await db.run('UPDATE users SET elo = ? WHERE id = ?', newEloOpponent, opponentId);

            res.json({
                newElo: newEloPlayer,
                delta: newEloPlayer - player.elo,
                opponentNewElo: newEloOpponent
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
}
