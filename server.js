// Import statements
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { NostrAuthMiddleware } from './nostr-auth.js';  
import cors from 'cors';

import path from 'path';

// Since __dirname is not available in ES modules, we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const views  = {
    protected: path.join(__dirname, 'public/views/protected.html'),
}
console.log(views)

const app = express();
const nostrAuth = new NostrAuthMiddleware();

// CORS Configuration
// Option 1: Allow all origins (for development only)
app.use(cors())
app.use(express.static(join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' })); // Increase the limit if necessary

// Option 2: More secure configuration with specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'], // Add your frontend URL(s)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you're using cookies/sessions
}))

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.post('/protected',
    nostrAuth.middleware(),
    (req, res) => {
        // Accessing the JSON body sent by the client
        const { room, username, avatarURL, relays, isPresenter } = req.body;
        console.log('Room:', room);
        console.log('Username:', username);
        console.log('Avatar URL:', avatarURL);
        console.log('Relays:', relays);
        console.log('isPresenter', isPresenter);

        //res.json({ message: 'Protected data' });
        res.sendFile(views.protected);
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

