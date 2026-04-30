const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user0\\Desktop\\Ferracad_web\\client\\src\\components\\client\\NewLicence.tsx', 'utf8');

let depth = 0;
const lines = content.split('\n');
lines.forEach((line, i) => {
    const open = (line.match(/<[a-zA-Z]/g) || []).length;
    const close = (line.match(/<\//g) || []).length;
    const selfClose = (line.match(/\/>/g) || []).length;
    
    const oldDepth = depth;
    depth += open - close - selfClose;
    
    if (depth > 6 && oldDepth <= 6) {
        console.log(`JUMP AT ${i + 1}: ${line.trim()} (Depth: ${oldDepth} -> ${depth})`);
    }
    if (depth <= 6 && oldDepth > 6) {
        console.log(`BACK AT ${i + 1}: ${line.trim()} (Depth: ${oldDepth} -> ${depth})`);
    }
});
console.log(`FINAL DEPTH: ${depth}`);
