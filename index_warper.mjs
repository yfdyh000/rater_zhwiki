import { promises as fs } from 'fs';
import process from 'process';

async function writes() {
    const indexjs = await fs.readFile("index.js", 'utf8');
    const script = await fs.readFile("dist/rater.js", 'utf8');
    var formatted = indexjs.replace(/\/\/ Otherwise,[\s\S]*?\);/g, script);
    await fs.writeFile("dist/rater_debuggable.js", formatted, 'utf8');
}
async function writesPub() {
    const script = await fs.readFile("dist/rater_debuggable.js", 'utf8');
    var formatted = script.replace(/\/\/# sourceMappingURL=data:.+\n/g, ''); // remove sourceMapping
    await fs.writeFile("dist/rater_pub.js", formatted, 'utf8');
}

const args = process.argv.slice(2);
if (args[0] == 'pub'){
    writesPub();
} else {
    writes();
}