exports.Game = function(socket,code,GameServer) {
	this.host;
	this.clients = {};
	this.socket = socket; //this is io
	this.code;
	this.maxParticipants = 1;
	this.startParticipants = 1;
	this.minParticipants = 1;
	//make the above -1 if you don't want to start on a certain number of participants
	this.participantsCanBeAdded = true;
	//this.GameServer;
	//Just use GameServer

	this.sendDirectMessage = function(sock,first,second){
		//console.log(this.socket.sockets);
		this.socket.sockets.connected[sock.id].emit(first,second);
	}

	this.init = function(host){
		this.host = host;
		this.socket = socket;
		this.code = code;
		//this.GameServer = GameServer;
		//console.log(this.GameServer);
		var t = this;
		this.host.on('disconnect',function(){t.quit(t)});
	}

	this.quit = function(t){
		console.log("game quit");
		//console.log(this);
		console.log(t.socket);
		t.socket.to(code).emit('endGame');
		GameServer.closeGame(t.code);
		//TODO: add message sent to clients that game has quit / make clients go back to homepage
		//TODO: when 0 players left, game quits
	}

	this.addParticipant = function(socket){
		if (this.participantsCanBeAdded && Object.keys(this.clients).length<this.maxParticipants){
			var client = {};
			client.socket = socket;
			this.clients[client.socket.id] = client;
			var t = this;
			console.log(t);
			client.socket.on('disconnect',function(){t.disconnectParticipant(t,client.socket.id)});
			if (this.startParticipants!=-1){
				if (Object.keys(this.clients).length==this.startParticipants){
					this.startGame();
				}
			}
			return true;
		}
		return false;
	}

	this.disconnectParticipant = function(t,id){
		console.log(t);
		delete t.clients[id];
		if ((Object.keys(t.clients).length < t.minParticipants)&&t.socket!=null){
			t.quit(t);
		}
	}

	this.startGame = function(){
		this.participantsCanBeAdded = false;
		this.socket.to(code).emit('startGame');
		var t = this;
		console.log(this.clients);
		this.clients[Object.keys(this.clients)[0]].socket.on('orientationEvent',function(evt){t.processControllerData(t,evt);})
	}

	this.processControllerData = function(t,evt){
		//console.log(evt);
		this.sendDirectMessage(this.host,'orientationData',evt);
	}
}