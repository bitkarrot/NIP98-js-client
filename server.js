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

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://nip-98-js-sample.vercel.app/', ]  // Production domains
      : ['http://localhost:3000'],  // Development
    credentials: true,  // Important for cookies/sessions
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

app.use(cors(corsOptions));

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});


app.post('/protected',
    nostrAuth.middleware(),
    (req, res) => {
        try {
            // Accessing the JSON body sent by the client
            const { room, username, avatarURL, relays, isPresenter } = req.body;
            console.log('Room:', room);
            console.log('Username:', username);
            console.log('Avatar URL:', avatarURL);
            console.log('Relays:', relays);
            console.log('isPresenter', isPresenter);

            res.status(302).json({ redirectUrl: '/views/protected.html' });
        } catch (error) {
            res.status(401).json({ error: 'Authentication failed' });
        }
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

