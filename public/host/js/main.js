function TiltHost() {
	this.socket = null;
	this.code = null;
	this.renderer;

	this.receivedCode = function(code){
		document.getElementById("code").innerHTML = code;
		this.code = code;
		//console.log(this.socket);
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
		document.getElementById("gamecontainer").style.display = "inherit";
		document.getElementById("logincontainer").style.display = "none";
		var canv = document.getElementById('canvas');
		canv.style.display="inherit";
		this.renderer = new Renderer(canv);
		this.renderer.init();
		var t = this;
		this.socket.on('orientationData',function(evt){t.handleDeviceOrientation(t,evt);});
		this.socket.on('hit',function(evt){t.handleHit(t,evt);});
	}

	this.handleDeviceOrientation = function(t,evt){
		//console.log(evt);
		var b = evt;
		//console.log(b);
		//document.getElementById("arrow").style.transform = "rotate("+(Math.round(b * 100) / 100).toString()+"deg)";
		t.renderer.updateOrientation(b);
	}

	this.handleHit = function(t,evt){
		t.renderer.hit(t.renderer,evt);
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