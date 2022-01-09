const { Subscriber } = require('../../mongo-models');


module.exports = {
  addNewSubscriber: async (userData)=>{
    const data=new Subscriber(userData);
    return data.save();
  }
  
};
