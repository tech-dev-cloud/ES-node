let redis=require('redis');


let client=redis.createClient({
    port: process.env.redis_port,
    host: process.env.redis_host
})

// client.auth(process.env.redis_password);

module.exports=client;