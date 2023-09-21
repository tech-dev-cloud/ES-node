const solr = require('solr-client');

const params = require('./env/development_params.json');

const users_client = solr.createClient({
  host: params.solr.ip,
  port: params.solr.port,
  core: 'users',
  solrVersion: '8.7',
  path: '/solr',
  get_max_request_entity_size: 1000,
  secure: false,
  bigint: true,
});
const products_client = solr.createClient({
  host: params.solrIp,
  port: params.solrPort,
  core: 'products',
  solrVersion: '8.7',
  path: '/solr',
  get_max_request_entity_size: 1000,
  secure: false,
  bigint: true,
});

//  let ids =[15134]
//  let solrQuery = users_client.query().fl("email");
//  console.log(JSON.stringify(solrQuery))
// users_client.realTimeGet(ids,{fl : ["email"]},(err, data)=>{
//     console.log("err -"+ err ,  data)
// })

// let query = client.createQuery().q({id:1323914,object_id:24996}).fl("stream_sort_date,created_by,updated_by,content_type,x_article_key,language_ids,id,primary_tag_id,object_id,object_model,pinned,feed_pinned,archived,created_by,content_stage,content_stage_value");
// client.get('select',query, (err,data)=>{
// console.log(err, JSON.stringify(data))
// })

// client.search(query,(err,data)=>{
//     console.log(err,data)
// })
// (content_client.softCommit = true);

module.exports = { users_client, products_client };
