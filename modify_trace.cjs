const fs = require('fs');
const path = 'c:/projects/algotrace/server/data/traces/word-search-ii.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let results = [];
for (let step of data.steps) {
    if (step.note && step.note.includes("Adding '") && step.note.includes("' to results")) {
        const word = step.note.split("'")[1];
        results.push(word);
    }
    step.results = [...results];
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
