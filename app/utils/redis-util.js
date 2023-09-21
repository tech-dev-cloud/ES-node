const redis = require('../../config/redisConnection');
const params = require('../../config/env/development_params.json');
module.exports = class RedisWrapper {
  constructor() {}

  static async get(key) {
    const val = await redis.get(key);
    return val;
  }

  static async ttl(key) {
    const val = await redis.ttl(key);
    return val;
  }

  static async save(key, dataToSave, expire) {
    return new Promise(async (resolve, reject) => {
      try {
        await redis.set(key, JSON.stringify(dataToSave));
        await redis.expire(key, expire);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }
  static async del(key) {
    return redis.del(key);
  }

  static async delByPattern(keyPattern) {
    redis.keys(keyPattern, (err, keys) => {
      if (keys.length) {
        redis.del(keys);
      }
    });
  }
};
