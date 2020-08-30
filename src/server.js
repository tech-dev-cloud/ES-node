let env=require('dotenv');
env.config();
const { startExpress, DB } = require('./config');
const migration=require('./app/migration/dbMigration')


  DB.start().then(res=>{
    migration().then(res=>{
      startExpress();
    }).catch(err=>{
      startExpress();
    })
  });


