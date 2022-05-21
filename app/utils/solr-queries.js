const { users_client, products_client } = require('../../config/solr-config');
const { SOLR_CORES } = require('./server-constant');

/**
 *
 * @param {*} ids : string, array
 * @param {*} query : urlencoded url, Query
 * @param {*} core  : users, cotent
 */
module.exports.realtimeget = function (ids, query, core) {
  return new Promise((res) => {
    getClient(core).realTimeGet(ids, query ? query : {}, (err, data) =>
      err ? res({}) : res(data)
    );
  });
};
/**
 *
 * @param {*} query :  urlencoded url, Query
 * @param {*} core : users, content
 */
function select(query, core) {
  return new Promise((res) => {
    getClient(core).search(query, (err, data) => (err ? res({}) : res(data)));
  });
}

function update(data, options, core) {
  return new Promise((res) => {
    getClient(core).update(data, options, (err, data) => {
      err && console.log('solr update', err);
      err ? res({}) : res(data);
    });
  });
}

function deleteByQuery(query, options, core) {
  return new Promise((res) => {
    getClient(core).deleteByQuery(query, options, (err, data) =>
      err ? res({}) : res(data)
    );
  });
}

function getClient(core) {
  console.log(products_client, core);
  switch (core) {
    case SOLR_CORES.users:
      return users_client;
    case SOLR_CORES.products:
      return products_client;
  }
}

module.exports = {
  users_client,
  products_client,
  select,
  update,
  deleteByQuery,
};
