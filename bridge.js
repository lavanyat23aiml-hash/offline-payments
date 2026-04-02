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

app.get('/toggle-hotspot', (req, res) => {
    const action = req.query.action; // 'on' or 'off'
    
    if (!['on', 'off'].includes(action)) {
        return res.status(400).send({ error: 'Invalid action. Must be on or off.' });
    }

    const scriptPath = path.join(__dirname, 'scripts', 'toggle-hotspot.ps1');
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -action ${action}`;

    console.log(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Stdout: ${stdout}`);
        res.send({ success: true, action, output: stdout });
    });
});

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`📡 Wi-Fi Bridge Server running at http://127.0.0.1:${PORT}`);
    console.log(`🔓 Run as Administrator to toggle your PC's Wi-Fi adapter.`);
    
    // Check for elevation
    exec('net session', (err) => {
        if (err) {
            console.error('\n' + '!'.repeat(50));
            console.error('⚠️  WARNING: NO ADMINISTRATOR PRIVILEGES DETECTED');
            console.error('The bridge is running, but it WILL NOT be able to toggle Wi-Fi.');
            console.error('Please close this window and run as Administrator.');
            console.error('!'.repeat(50) + '\n');
        } else {
            console.log('✅ Administrator privileges confirmed. Hardware control enabled.');
        }
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the other process or use a different port.`);
    } else {
        console.error('Server error:', err.message);
    }
    process.exit(1);
});
