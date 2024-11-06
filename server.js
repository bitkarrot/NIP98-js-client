// Import statements
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { NostrAuthMiddleware } from './nostr-auth.js';  
import cors from 'cors';


// Since __dirname is not available in ES modules, we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS Configuration
// Option 1: Allow all origins (for development only)
app.use(cors())

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

app.use(express.static(join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' })); // Increase the limit if necessary

const nostrAuth = new NostrAuthMiddleware();
app.post('/protected',
    nostrAuth.middleware(),
    (req, res) => {
        res.json({ message: 'Protected data' });
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

