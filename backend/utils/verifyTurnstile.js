const fetch = require("node-fetch");

/**
 * Verifies a Cloudflare Turnstile CAPTCHA token.
 * @param {string} token - The CAPTCHA token from the client.
 * @returns {Promise<boolean>} - True if valid, false otherwise.
 */
async function verifyTurnstile(token) {
  if (!token) return false;

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY, // stored in .env
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error("Error verifying Turnstile CAPTCHA:", err);
    return false;
  }
}

module.exports = verifyTurnstile;