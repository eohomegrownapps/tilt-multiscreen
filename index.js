//Requires
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gameserver = require('./gameserver');

//Express Server
app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/indexhost.html');
});

app.get('/play', function(req, res){
  res.sendFile(__dirname + '/indexclient.html');
});

//Game Code
var gs = new gameserver.GameServer(io);
gs.init();

io.on('connection', function(socket){
  socket.on('registerForCode', function(){
    console.log('host registered');
    gs.newGame(socket);
  });
  socket.on('checkCode', function(code){
    console.log('client registered');
    console.log(code);
    gs.joinGame(socket,code);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});