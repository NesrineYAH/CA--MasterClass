const fetch = require("node-fetch");

const PAYPAL_API =
    process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();
    return data.access_token;
}

module.exports = {
    PAYPAL_API,
    getPayPalAccessToken,
};