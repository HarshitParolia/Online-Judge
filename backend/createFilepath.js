const fs = require('fs');
const path = require('path');

const dirCodes = path.join(__dirname, 'codes');

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const createFilepath = async (format, content, name, problem) => {
    const fileID = "_" + name;
    const filename = `${fileID}-${problem.split(' ').join('-')}.${format}`;
    const filePath = path.join(dirCodes, filename);
    await fs.writeFileSync(filePath, content);
    return { filePath, dirCodes };
};

module.exports = {
    createFilepath
};
