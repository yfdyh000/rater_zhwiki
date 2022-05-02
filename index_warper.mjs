import { promises as fs } from 'fs';
import process from 'process';

async function writesPub() {
    const indexjs = await fs.readFile("index.js", 'utf8');
    const script = await fs.readFile("dist/rater.js", 'utf8');
    var wraped = indexjs.replace(/\/\/ Otherwise,[\s\S]*?\);/g, script);

     // remove sourceMapping
     // it is too large and will cause the debugger to be unhealthy due to wrapping inside the an file
    var reduced = wraped.replace(/\/\/# sourceMappingURL=data:.+\n/g, '');
    await fs.writeFile("dist/rater_pub.js", reduced, 'utf8');
}
async function writesMin() {
    const commentjs = await fs.readFile("comment.js", 'utf8');
    const script = await fs.readFile("dist/rater.min.js", 'utf8');
    var formatted = commentjs.replace(/\/\*content\*\//g, script);
    await fs.writeFile("dist/rater.min.js", formatted, 'utf8');
}

const args = process.argv.slice(2);
if (args[0] == 'pub'){
    writesPub();
} else if (args[0] == 'commenttomin'){
    writesMin();
}