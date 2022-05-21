const { SOLR_CORES } = require('../../utils/server-constant');
const solr = require('../../utils/solr-queries');
const SolrQueryBuilder = require('./solr-query-builder');

class Solr {
  syncUser(users, options) {
    return solr.update(users, options, SOLR_CORES.users);
  }

  async getProducts(searchString) {
    const solrBuilder = new SolrQueryBuilder(searchString, ['status:1']);
    const data = await solrBuilder
      .createSolrQuery()
      .apiHit(SOLR_CORES.products);
    return data;
  }
}
module.exports = Solr;
