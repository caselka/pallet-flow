// Copies the web game into desktop/game so the packaged app is self-contained.
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, 'game');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const f of ['game.html', 'game.js', 'shell.js']) fs.copyFileSync(path.join(__dirname, '..', f), path.join(out, f));
console.log('Copied game files to', out);
