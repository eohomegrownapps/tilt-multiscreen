function TiltHost() {
	this.socket = null;
	this.code = null;

	this.receivedCode = function(code){
		document.getElementById("code").innerHTML = code;
		this.code = code;
		console.log(this.socket);
		var t = this;
		this.socket.on('startGame',function(){t.startGame();})
	}

	this.registerForCode = function(){
		this.socket.emit('registerForCode');
		var t = this;
		this.socket.on('newCode',function(code){t.receivedCode(code);});
	}

	this.startGame = function(){
		document.getElementById("logincontainer").className = "animate-top";
	}

	this.init = function(){
		this.io = io();
		this.socket = io.connect();
		this.registerForCode();
	}
}

function start() {
	var t = new TiltHost();
	t.init();
}

window.onload = start;