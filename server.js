import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.static(join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' })); // Increase the limit if necessary
app.use(cors())

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// app.post('/auth',
//     nostrAuth.middleware(),
//     (req, res) => {
//         try {
//             // Accessing the JSON body sent by the client
//             const { room, username, avatarURL, relays, isPresenter } = req.body;
//             console.log('Room:', room);
//             console.log('Username:', username);
//             console.log('Avatar URL:', avatarURL);
//             console.log('Relays:', relays);
//             console.log('isPresenter', isPresenter);

//             // TODO: Redirect to hivetalk room give above info, correctly
//             res.status(200).json({ message: 'Authentication successful'});

//         } catch (error) {
//             console.log("authentication failed")
//             res.status(401).json({ error: 'Authentication failed' });
//         }
//     }
// );


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

