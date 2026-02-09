const crypto = require('crypto');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const BUFFER_KEY = process.env.BUFFER_KEY
const ENCRYPT_METHOD = "aes-256-cbc"
const ENCODING = "hex"

function getEncryptedString(rawString) {
    let iv = Buffer.from(BUFFER_KEY)
    let cipher = crypto.createCipheriv(ENCRYPT_METHOD, Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(rawString)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    return encrypted.toString(ENCODING)
}

function getDecryptedString(encrypted) {
    let iv = Buffer.from(BUFFER_KEY)
    let encryptedText = Buffer.from(encrypted, ENCODING)
    let decipher = crypto.createDecipheriv(ENCRYPT_METHOD, Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedText)

    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
}

function generateToken(refreshToken, username) {
    // 本当は有効期限とかを入れる
    const source = {
        refreshToken,
        username
    }
    return getEncryptedString(JSON.stringify(source));
}

function decodeToken(token) {
    return JSON.parse(getDecryptedString(token));
}

module.exports = { generateToken, decodeToken };
