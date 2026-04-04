import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => {
    res.send({ status: 'alive', time: new Date().toISOString() });
});

let savedProfile = '';

app.get('/toggle-hotspot', (req, res) => {
    const action = req.query.action; // 'on' or 'off'
    
    if (!['on', 'off'].includes(action)) {
        return res.status(400).send({ error: 'Invalid action. Must be on or off.' });
    }

    if (action === 'off') {
        // Save the current profile name so we can reconnect later
        exec('netsh wlan show interfaces', (err, stdout) => {
            const match = stdout.match(/Profile\s*:\s*(.+)/);
            if (match) {
                savedProfile = match[1].trim();
                console.log(`Saved Wi-Fi Profile: ${savedProfile}`);
            }

            // Disconnect Wi-Fi gently (Does NOT disable the adapter hardware)
            exec('netsh wlan disconnect', (errDisconnect, stdoutDisconnect) => {
                if (errDisconnect) {
                    console.error('Disconnect Error:', errDisconnect.message);
                    return res.status(500).send({ error: errDisconnect.message });
                }
                console.log(`Disconnected: ${stdoutDisconnect.trim()}`);
                res.send({ success: true, action, output: stdoutDisconnect.trim() });
            });
        });
    } else if (action === 'on') {
        if (savedProfile) {
            // Reconnect to the saved Wi-Fi profile
            exec(`netsh wlan connect name="${savedProfile}"`, (err, stdout) => {
                if (err) {
                    console.error('Connect Error:', err.message);
                    return res.status(500).send({ error: err.message });
                }
                console.log(`Connected: ${stdout.trim()}`);
                res.send({ success: true, action, output: stdout.trim() });
            });
        } else {
            console.log('No saved profile found. Please connect manually.');
             // Fallback: Just let Windows auto-connect if possible
            res.send({ success: true, action, output: 'No profile saved to reconnect automatically.' });
        }
    }
});

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`📡 Wi-Fi Bridge Server running at http://127.0.0.1:${PORT}`);
    console.log(`✅ Using Gentle Wi-Fi Disconnect/Connect (Adapter remains enabled).`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the other process or use a different port.`);
    } else {
        console.error('Server error:', err.message);
    }
    process.exit(1);
});
