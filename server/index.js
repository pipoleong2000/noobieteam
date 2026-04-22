require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB, Workspace } = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Lock Registry: { [cardId]: { user: 'email', socketId: '...', expiresAt: Date.now() } }
const lockRegistry = {};

io.on('connection', (socket) => {
    socket.on('card:lock', (data) => {
        const { cardId, userEmail, workspaceId } = data;
        if (!cardId || !userEmail) return;
        
        const existingLock = lockRegistry[cardId];
        if (existingLock && existingLock.socketId !== socket.id && existingLock.expiresAt > Date.now()) {
            socket.emit('card:lock_rejected', { cardId, message: `Already locked by ${existingLock.user}` });
            return;
        }
        
        socket.join(workspaceId);
        lockRegistry[cardId] = { user: userEmail, socketId: socket.id, expiresAt: Date.now() + 600000, workspaceId };
        io.to(workspaceId).emit('card:locked', { cardId, user: userEmail });
    });

    socket.on('card:unlock', (data) => {
        const { cardId, workspaceId } = data;
        if (!cardId) return;
        if (lockRegistry[cardId] && lockRegistry[cardId].socketId === socket.id) {
            delete lockRegistry[cardId];
            if (workspaceId) {
                io.to(workspaceId).emit('card:unlocked', { cardId });
            } else {
                io.emit('card:unlocked', { cardId }); // fallback
            }
        }
    });

    socket.on('disconnect', () => {
        for (const cardId in lockRegistry) {
            if (lockRegistry[cardId].socketId === socket.id) {
                const workspaceId = lockRegistry[cardId].workspaceId;
                delete lockRegistry[cardId];
                if (workspaceId) io.to(workspaceId).emit('card:unlocked', { cardId });
            }
        }
    });
});

const PORT = process.env.PORT || 8000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@noobieteam.ai';

// Connect to MongoDB
connectDB();

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client')));

app.get('/api/config', (req, res) => {
    res.json({ adminEmail: ADMIN_EMAIL });
});

// RBAC: Secure workspace deletion endpoint
app.delete('/api/workspaces/:id', async (req, res) => {
    const userEmail = req.headers['user-email'] || req.body.email || req.query.email;
    if (!userEmail || userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Forbidden: Only admins can delete workspaces." });
    }
    try {
        await Workspace.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Workspace deleted successfully." });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Use other API routes
app.use('/api', apiRoutes);
        
// Dynamic Catch-All Route for Frontend Public Documentation
app.get('/docs/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
