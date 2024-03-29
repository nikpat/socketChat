var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8081);

function handler (req, res) {
  fs.readFile(__dirname + '/client.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var users = {};
var username = {};

io.sockets.on('connection', function (socket) {

      socket.emit("ack",{'msg' : "Welcome to server !"});

      // when the client emits 'sendchat', this listens and executes
      socket.on('sendchat', function (data) {
          // we tell the client to execute 'updatechat' with 2 parameters
          io.sockets.emit('updatechat', socket.username, data);
      });

      // when the client emits 'adduser', this listens and executes
      socket.on('adduser', function(username){
          // we store the username in the socket session for this client
          socket.username = username;
          // add the client's username to the global list
          usernames[username] = username;
          // echo to client they've connected
          socket.emit('updatechat', 'SERVER', 'you have connected');
          // echo globally (all clients) that a person has connected
          socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
          // update the list of users in chat, client-side
          io.sockets.emit('updateusers', usernames);
      });

      // when the user disconnects.. perform this
      socket.on('disconnect', function(){
          // remove the username from global usernames list
          try{
                delete usernames[socket.username];
                // update list of users in chat, client-side
                io.sockets.emit('updateusers', usernames);
          }
          catch(err){
                console.log("not logged in!")
          }
          // echo globally that this client has left
          socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has         disconnected');
      });
});