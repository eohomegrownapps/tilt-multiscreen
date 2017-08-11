var game = require('./game');

exports.GameServer = function(socket){
	this.games = {};
	this.codeLength = 6;
	this.codeChars = "0123456789";
	this.socket = socket;

	this.sendDirectMessage = function(sock,first,second){
		//console.log(this.socket.sockets);
		this.socket.sockets.connected[sock.id].emit(first,second);
	}

	this.isPresent = function(code){
		var check = false;
		for (var key in this.games){
			if (this.games.hasOwnProperty(key)){
				if (key==code){
					check = true;
				}
			}
		}
		return check;
	}

	this.generateCode = function(){
		//TODO: Add support for unlikely case where there is no available code
		while (true){
			var code = "";
			for (var i = 0; i<this.codeLength; i++){
				code+=this.codeChars[Math.floor(Math.random()*this.codeChars.length)];
			}
			var check = this.isPresent(code);
			if (check==false){
				return code;
			}
		}
	}

	this.joinGame = function(client, code){
		var check = this.isPresent(code);
		var f = true;
		if (!check){
			f = false;
		}
		if (f==true){
			f=this.games[code].addParticipant(client);
		}
		if (f==true){
			client.join(code);
			this.sendDirectMessage(client,'addToGame',1);
		} else {
			this.sendDirectMessage(client,'addToGame',0);
		}
	}

	this.newGame = function(host){
		var code = this.generateCode();
		//console.log(code);
		console.log(host.id);
		var t = this;
		var g = new game.Game(this.socket,code,t);
		g.init(host);
		//console.log(g.code);
		host.join(code);
		this.games[code] = g;
		//host.emit('newCode',code);
		this.sendDirectMessage(host,'newCode',code);
	}

	this.closeGame = function(code){
		delete this.games[code];
	}

	this.init = function(){
		//any init code here
	}
}