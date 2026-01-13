
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { openDb, initDb } from './database.js';
import { setupPvpRoutes } from './pvpRoutes.js';

const app = express();
const PORT = 3001;
const SECRET_KEY = 'rhodes-secret-key-change-this-in-prod'; // Simple secret for dev

app.use(cors());
app.use(express.json());

// Initialize Database
let db;
initDb().then(database => {
    db = database;
    setupPvpRoutes(app, db, authenticateToken);
});

// Middleware to verify Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// REGISTER
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
            'INSERT INTO users (username, password, elo) VALUES (?, ?, ?)',
            username, hashedPassword, 1000
        );

        const userId = result.lastID;
        const token = jwt.sign({ id: userId, username }, SECRET_KEY);

        res.json({ token, userId, username, elo: 1000 });
    } catch (e) {
        if (e.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: e.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
            res.json({ token, userId: user.id, username: user.username, elo: user.elo || 1000 });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET CURRENT USER
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.get('SELECT id, username, elo FROM users WHERE id = ?', req.user.id);
        if (!user) return res.sendStatus(404);
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- GAME STATE ROUTES ---

// GET GAME STATE
app.get('/api/save', authenticateToken, async (req, res) => {
    try {
        const row = await db.get('SELECT data FROM gamestate WHERE user_id = ?', req.user.id);
        if (row) {
            res.json(JSON.parse(row.data));
        } else {
            res.json(null); // No save found
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// SAVE GAME STATE
app.post('/api/save', authenticateToken, async (req, res) => {
    const { data } = req.body; // Expecting data to be the full state object
    try {
        await db.run(
            `INSERT INTO gamestate (user_id, data, updated_at) 
             VALUES (?, ?, CURRENT_TIMESTAMP) 
             ON CONFLICT(user_id) DO UPDATE SET 
             data = excluded.data, 
             updated_at = CURRENT_TIMESTAMP`,
            req.user.id, JSON.stringify(data)
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
