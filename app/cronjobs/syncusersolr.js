const { SOLR_CORES } = require('../utils/server-constant');
const { update } = require('../utils/solr-queries');
const db = require('../models');
module.exports = async function (req, res) {
  const users = await db.sequelize.query('select * from eduseeker.products', {
    type: db.sequelize.QueryTypes.SELECT,
  });
  try {
    // const data = await update(users, null, SOLR_CORES.products);
  } catch (err) {
    console.error('error===', err);
  }
};
