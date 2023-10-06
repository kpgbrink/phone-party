
import { promises as fs } from 'fs';

let generatedString = "";

const playerFolder = './public/assets/player';

(async () => {
    generatedString += `export const avatarImages = {\n`;
    const folders = await fs.readdir(playerFolder);
    for (const folder of folders) {
        generatedString += `    ${folder}: [\n`;
        const files = await fs.readdir(`${playerFolder}/${folder}`);
        for (const file of files) {
            // const fileName = file.split('.')[0];
            generatedString += `        '${file}',\n`;
        }
        generatedString += `    ],\n`;
    }
    generatedString += `}\n`;
    generatedString = generatedString.slice(0, -1);
    console.log(generatedString);
    await fs.writeFile('./src/client/PhaserPages/objects/avatarImages.generated.ts', generatedString);
})();


