'use strict';
const solr = require('../../utils/solr-queries');
class SolrQueryBuilder {
  q;
  fq;
  fl;
  sort;
  rows;
  start;

  PARAM_Q = 'q=';
  PARAM_FQ = '&fq=';
  PARAM_FL = '&fl=';
  PARAM_SORT = '&sort=';
  PARAM_ROWS = '&rows=';
  PARAM_START = '&start=';

  query;

  constructor(q, fq, fl, sort, row, start) {
    this.q = q || '*:*';
    this.fq = fq || [];
    this.fl = fl || [];
    this.sort = sort || '';
    this.rows = row || 10;
    this.start = start || 0;
    this.query = '';
  }

  createSolrQuery() {
    this.query = this.PARAM_Q + this.q;

    if (this.fq.length > 0) {
      this.query += this.PARAM_FQ + this.fq.join(this.PARAM_FQ);
    }

    if (this.fl.length > 0) {
      this.query += this.PARAM_FL + this.fl.join(',');
    }

    if (this.sort.length > 0) {
      this.query += this.PARAM_SORT + this.sort;
    }

    this.query += this.PARAM_START + this.start;
    this.query += this.PARAM_ROWS + this.rows;
    return this;
  }

  apiHit(core) {
    return new Promise((resolve, reject) => {
      solr
        .select(encodeURI(this.query), core)
        .then((body) => {
          if (body && body.response && body.response.docs) {
            resolve(null, body.response.docs);
          } else {
            resolve(null, []);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = SolrQueryBuilder;
