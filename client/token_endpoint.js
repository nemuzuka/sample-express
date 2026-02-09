const axios = require('axios')
require('dotenv').config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

async function fetchToken(code, codeVerifier) {
    const response = await axios.post('http://localhost:18080/api/corporates/corporate_code_001/tenants/tenant_code_001/oauth/token',
        {
            code,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier,
            redirect_uri: 'myapp://net.jp.vss.flutter-auth/auth-callback',
        },
        {
            auth: {
                username: clientId,
                password: clientSecret,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    return response.data;
}

module.exports = { fetchToken };
