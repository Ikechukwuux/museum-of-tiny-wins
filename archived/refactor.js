const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.next')) {
            results = results.concat(walk(fullPath));
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walk('./mtw-app');
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Replace accessionNumber prop assignment with date string (except in WinCard component signature)
    // matches `accessionNumber={win.id}` or `accessionNumber={42}` etc.
    content = content.replace(/accessionNumber=\{[^\}]+\}/g, 'date="2026-08-30"');
    content = content.replace(/accessionNumber:\s*\d+,?/g, 'date: "2026-08-30",');

    // 2. Remove year prop assignment
    content = content.replace(/year=\{[^\}]+\}/g, '');
    content = content.replace(/year:\s*\d+,?/g, '');

    // 3. Update WinCardProps interface in WinCard.tsx and WinCardGridItem
    if (file.includes('WinCard.tsx') || file.includes('WinCardGrid.tsx')) {
        content = content.replace(/accessionNumber:\s*number;/, 'date: string;');
        content = content.replace(/year:\s*number;/, '');
        // For destructured props
        content = content.replace(/accessionNumber,/g, 'date,');
        content = content.replace(/year,/g, '');
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        modifiedCount++;
    }
});

console.log(`Updated ${modifiedCount} files.`);
