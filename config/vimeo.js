
var Vimeo = require('vimeo').Vimeo;
var client = new Vimeo(process.env.VIMEO_CLIENT_ID, process.env.VIMEO_CLIENT_SECRET, process.env.VIMEO_ACCESS_TOKEN);

module.exports = client;