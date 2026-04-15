const fetch = require('node-fetch');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function createAuthCode(code, date) {
    const codeWithoutSpaces = code.replace(/\s+/g, "");
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
}

module.exports = {
    createAuthCode
};
