const fs = require('fs');
const path = require('path');

const envFiles = [
    {
        filePath: path.resolve(__dirname, '../apps/api/.env'),
        content: `PORT=3000
CLIENT_URL=http://localhost:5173
DATABASE_URL=mongodb://localhost/nest
JWT_SECRET=REPLACE_WITH_YOUR_OWN_SECRET
LANGSEARCH_API_KEY=REPLACE_WITH_YOUR_OWN_KEY
OPENAI_API_KEY=REPLACE_WITH_YOUR_OWN_KEY
ENABLE_AI_PRONOSTICS=false
`,
    },
    {
        filePath: path.resolve(__dirname, '../apps/client/.env'),
        content: `VITE_API_URL=http://localhost:3000/api`,
    },
];

envFiles.forEach(({ filePath, content }) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, { encoding: 'utf8' });
        console.log(`Created ${filePath}`);
    } else {
        console.log(`${filePath} already exists. Skipping...`);
    }
});
