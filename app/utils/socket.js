let io;
module.exports = {
  init:(server)=>{
    io = require('socket.io')(server,{
      cors: {
        origin: '*',
      }
    });
    io.on('connection', socket=>{
      socket.on('setup', userId=>{
        socket.on('join', userId);
      });
    })
    io.on('disconnect', err=>{
      console.log('disconnect--',err);
    })
  },
}