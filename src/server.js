let env=require('dotenv');
env.config();
const { startExpress, DB } = require('./config');

  
  DB.start().then(()=>{
    startExpress();
    // migration().then(res=>{
    // }).catch(err=>{
    //   startExpress();
    // })
  });


