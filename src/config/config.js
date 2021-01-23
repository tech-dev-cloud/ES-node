// module.exports = {
//   Development: {
//     adminCredentials: {
//       email: 'admin@admin.com',
//       password: 'admin'
//     },
//     NODE_MAILER: {
//       transporter: {
//         host: 'smt.gmail.com',
//         secure: false,
//         auth: {
//           user: 'tamit9509@gmail.com', // generated ethereal user
//           pass: 'asdkncasd', // generated ethereal password
//         },
//       },
//       sender: `theeduseeker@gmail.com`
//     },
//     nodeMailer: {
//       code: 'Gmail',
//       user: 'mukkumukeshkumar321@gmail.com',
//       password: 'MukeshMukku@123'
//     },
//     platform: 'eduseeker',
//     PAYMENT_GATEWAY: {
//       SALT: process.env.PRIVATE_SALT || 'a3953c4a52994262b8ec6386f82e54c1',
//       TOKEN: process.env.PRIVATE_AUTH_TOKEN || 'test_f5620ac7cb2d9ede77c5017d85c',
//       API_KEY: process.env.PRIVATE_API_KEY || 'test_b0c865ae388b27e2711728fee78'
//     }
//   }
// };
'use strict';

var nconf = require('nconf');
	// json5 = require('json5'),
	// _ = require('lodash'),
	// glob = require('glob'),
	// path = require('path'),


// variable to import to nconf from process.env
const envVariables = ['PORT', 'NODE_ENV', 'PRIVATE_SALT'];

// var rootPath = path.normalize(__dirname + '/..');

// Load app configuration
// var computedConfig = {
// 	root: rootPath,
// 	modelsDir: rootPath + '/app/models',
// 	modelsMongoDir: rootPath + '/app/mongoModels'
// };

//
// Setup nconf to use (in-order):
//   1. Locally computed config
//   2. Command-line arguments
//   3. Some Environment variables
//   4. Some defaults
//   5. Environment specific config file located at './env/<NODE_ENV>.json'
//   6. Shared config file located at './env/all.json'
//
nconf.argv()
	.env(envVariables)// Load select environment variables
	.defaults({
		store: {
			NODE_ENV: 'development'
		}
	});

module.exports = nconf.get();
/**
 * Get files by glob patterns
 */

// module.exports.loadEnv = async function () {
// 	// console.log("nodeenv",nconf.get())
// 	nconf.env(envVariables).defaults(
// 		await getEnv(
// 			nconf.get('VAULT'),
// 			nconf.get('TENANT_ID'),
// 			nconf.get('CLIENT_ID'),
// 			nconf.get('CLIENT_SECRET'))).overrides({ store: computedConfig })
// 	module.exports.config = nconf.get();
	// return nconf.get()
// }
