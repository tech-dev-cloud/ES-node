const CryptoJS = require('crypto-js');

function encrypt(key, data) {
  return CryptoJS.AES.encrypt(data, key).toString();
}

function decrypt(key, encryptData) {
  return CryptoJS.AES.decrypt(encryptData, key).toString(CryptoJS.enc.Utf8);
}

module.exports = {
  encrypt,
  decrypt
}