exports.Game = function(socket,code,GameServer) {
	this.host;
	this.clients = [];
	this.socket;
	this.code;
	this.maxParticipants = 1
	this.startParticipants = 1
	//make the above -1 if you don't want to start on a certain number of participants
	this.participantsCanBeAdded = true;
	//this.GameServer;
	//Just use GameServer

	this.sendDirectMessage = function(socket,first,second){
		this.sockets.socket(socket.id).emit(first,second);
	}

	this.init = function(host){
		this.host = host;
		this.socket = socket;
		this.code = code;
		//this.GameServer = GameServer;
		//console.log(this.GameServer);
		var t = this;
		this.host.on('disconnect',t.quit);
	}

	this.quit = function(){
		console.log("game quit");
		GameServer.closeGame(this.code);
		//TODO: add message sent to clients that game has quit / make clients go back to homepage
		//TODO: when 0 players left, game quits
	}

	this.addParticipant = function(socket){
		if (this.participantsCanBeAdded && this.clients.length<this.maxParticipants){
			var client = {};
			client.socket = socket;
			this.clients.push(client);
			if (this.startParticipants!=-1){
				if (this.clients.length==this.startParticipants){
					this.startGame();
				}
			}
			return true;
		}
		return false;
	}

	this.startGame = function(){
		this.participantsCanBeAdded = false;
	}
}