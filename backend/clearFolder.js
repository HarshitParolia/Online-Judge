const fs = require('fs');
const path = require('path');

const clearFolder = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.error(`Error clearing the folder: ${folderPath}`, err);
    }
};
module.exports = clearFolder;

