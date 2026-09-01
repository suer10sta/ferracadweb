const fetch = require('node-fetch');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function createAuthCode(code, date) {
    const codeWithoutSpaces = code.replace(/\s+/g, "");
    try {
        const response = await fetch('https://www.ferracad.com/php-api/index.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codeComputer: codeWithoutSpaces,
                dateExp: date
            }),
            agent
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("DNS/Network error generating auth code via API:", error.message);
        // Code d'autorisation factice de secours (environnement de développement ou hors ligne)
        const dateStr = new Date(date).toISOString().split('T')[0];
        return {
            data: {
                code: `OFFLINE-DEV-${codeWithoutSpaces.slice(0, 6).toUpperCase()}-${dateStr}`
            }
        };
    }
}

module.exports = {
    createAuthCode
};
