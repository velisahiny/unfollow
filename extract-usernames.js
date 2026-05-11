const fs = require('fs');

function extractUsernames(filePath) {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    const usernames = [];

    for (const item of data) {
        if (!item.label_values) continue;

        for (const label of item.label_values) {
            if (label.label === "Username" && label.value) {
                usernames.push(label.value);
            }
        }
    }

    return usernames;
}

function writeUsernamesToFile(usernames, outputPath) {
    const content = usernames.join('\n');
    fs.writeFileSync(outputPath, content, 'utf-8');
}

// CLI entry point
(function main() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.log("Usage: node script.js <input_json_file> <output_file>");
        process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1];

    const usernames = extractUsernames(inputFile);
    writeUsernamesToFile(usernames, outputFile);

    console.log(`✅ Extracted ${usernames.length} usernames to ${outputFile}`);
})();