const crypto = require('crypto')
require("dotenv").config()
const jwt = require('jsonwebtoken-promisified')
const jwtsim = require('jwt-simple')
const bcrypt = require('bcrypt')
const saltRounds = 10
const AES_SECRET_KEY = process.env.AES_SECRET_KEY
const AES_IV = process.env.AES_IV
const fs = require("fs")
const privateKey = fs.readFileSync(privateKeyPath, "utf8")
const hashData = (data) => {
    return new Promise(async (resolve) => {
        try {
            bcrypt.hash(data, saltRounds, function (err, hash) {
                resolve(hash)
            })
        } catch (error) {
            console.error(error)
            resolve(data)
        }
    })
}
const compareData = (data, hash) => {
    return new Promise(async (resolve) => {
        try {
            bcrypt.compare(data, hash, function (err, match) {
                resolve(match)
            })
        } catch (error) {
            console.error(error)
            resolve(data)
        }
    })
}
// const jwtEncode = (user_profile) => {
//     return new Promise(async (resolve) => {
//         try {
//             const accessToken = jwt.sign(user_profile, privateKey, {
//                 expiresIn: "2hr"
//             });
//             resolve(accessToken)
//         } catch (error) {
//             console.error(error)
//             resolve(false)
//         }
//     });
// };
const jwtEncode = (user_profile) => {
    return new Promise(async (resolve) => {
        try {
            const accessToken = await jwt.signAsync(user_profile, privateKey, {
                expiresIn: '2h'
            });
            resolve(accessToken);
        } catch (error) {
            console.error(error);
            resolve(false);
        }
    });
};
const aesEncrypt = async (plainText) => {
    return new Promise(async (resolve) => {
        try {
            let bufSecret = Buffer.from(AES_SECRET_KEY, 'base64')
            let bufIv = Buffer.from(AES_IV, 'base64')
            let ec = encrypt(plainText, bufSecret, bufIv)
            let cipherText = ec.encryptedData
            resolve({ payload: cipherText })
        } catch (error) {
            console.error(error)
            resolve(error)
        }
    })
}
const aesDecrypt = async (cipherText) => {
    return new Promise(async (resolve) => {
        try {
            let bufSecret = Buffer.from(AES_SECRET_KEY, 'base64')
            let bufIv = Buffer.from(AES_IV, 'base64')
            let dc = decrypt(cipherText, bufSecret, bufIv)
            resolve(dc)
        } catch (error) {
            console.error(error)
            resolve(error)
        }
    })
}
function encrypt(text, key, iv) {
    let cipher = crypto.createCipheriv(
        'aes-256-cbc', Buffer.from(key), iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return {
        encryptedData: encrypted.toString('base64')
    }
}
function decrypt(text, key, iv) {
    let encryptedText = Buffer.from(text, 'base64')
    let decipher = crypto.createDecipheriv(
        'aes-256-cbc', Buffer.from(key), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return {
        data: decrypted.toString()
    }
}
const textEncrypt = async (text) => {
    return new Promise(async (resolve) => {
        try {
            let bufSecret = Buffer.from(AES_SECRET_KEY, 'base64')
            let bufIv = Buffer.from(AES_IV, 'base64')
            let cipher = crypto.createCipheriv(
                'aes-256-cbc', Buffer.from(bufSecret), bufIv)
            let encrypted = cipher.update(text)
            encrypted = Buffer.concat([encrypted, cipher.final()])
            encrypted = encrypted.toString('base64')
            resolve(encrypted)
        } catch (error) {
            console.error(error)
            resolve(error)
        }
    })
}
const textDecrypt = async (text) => {
    return new Promise(async (resolve) => {
        try {
            let bufSecret = Buffer.from(AES_SECRET_KEY, 'base64')
            let bufIv = Buffer.from(AES_IV, 'base64')
            let encryptedText = Buffer.from(text, 'base64')
            let decipher = crypto.createDecipheriv(
                'aes-256-cbc', Buffer.from(bufSecret), bufIv)
            let decrypted = decipher.update(encryptedText)
            decrypted = Buffer.concat([decrypted, decipher.final()])
            decrypted = decrypted.toString()
            resolve(decrypted)
        } catch (error) {
            console.error(error)
            resolve(error)
        }
    })
}

const checkApiKey = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let dc = await aesDecrypt(data)
            const payload = jwtsim.decode(dc.data, process.env.JWT_SECRET_KEY)
            if (payload.exp > Date.now()) {
                if (payload.sub === moment().add(123, 'years').format('YYYYDDMM')) {
                    resolve(true)
                }
                else {
                    resolve(false)

                }
            }
            else {
                resolve(false)
            }

        } catch (error) {
            console.error(error)
            resolve(false)
        }
    })
}
const encodeApiKey = async () => {
    return new Promise(async (resolve) => {
        try {
            let text = moment().add(123, 'years').format('YYYYDDMM')
            const expires = Date.now() + (60 * 1000)
            const payload1 = {
                sub: text,
                iat: Date.now(),
                exp: expires
            }
            const payload = jwtsim.encode(payload1, process.env.JWT_SECRET_KEY)
            let cp = await aesEncrypt(payload)
            resolve(cp.payload)
        } catch (error) {
            console.error(error)
            resolve(error)
        }
    })
}


module.exports = {
    hashData, compareData, jwtEncode, aesEncrypt,
    aesDecrypt, textEncrypt, textDecrypt, encodeApiKey, checkApiKey
} 
