//TODO: implement endGame socket listener
function TiltClient() {
	this.noCode = true;
	this.gameStarted = false;
	this.timer;
	this.renderer;
	this.left = false;

	this.init = function(){
		this.io = io();
		this.socket = io.connect();
		this.noCode = true;
		this.gameStarted = false;
		this.co = new ComplementaryOrientation();
	}

	this.showLoader = function(){
		document.getElementById("loader").style.display = "inherit";
	}

	this.hideLoader = function(){
		document.getElementById("loader").style.display = "none";
	}

	this.register = function(code){
		this.showLoader();
		if (this.noCode){
			this.socket.emit('checkCode',code);
			var t = this;
			this.socket.on('addToGame', function(data){
				console.log("contacted server");
				if (t.noCode){
					console.log(data);
					if (data==1){
						t.startWaitingRoom();
					} else {
						t.failedToAdd();
					}
				}
			});
		}
		this.hideLoader();
	}

	this.failedToAdd = function(){
		//this.noCode = false;
		throwError("Invalid Code");
	}

	this.startWaitingRoom = function(){
		this.noCode = false;
		document.getElementById("code").disabled = true;
		this.showLoader();
		throwError("Waiting for game to start");
		var t = this;
		this.socket.on('startGame',t.startGame());
	}

	this.endGame = function(){
		console.log("end game");
	}

	this.startGame = function(){
		console.log("game started");
		this.gameStarted = true;
		document.getElementById("logincontainer").className = "animate-top";
		this.hideLoader();
		document.getElementById("gamecontainer").style.display = "inherit";
		var t = this;
		this.socket.on('endGame',t.endGame());
		this.timer = setInterval(function(){t.handleDeviceOrientation(t);},30);
		sleep.prevent();
	}

	this.handleDeviceOrientation = function(t){
		var q = t.co.getOrientation();
		var rotation = quatToEuler(q);
		var r = eulerToAngle(rotation.x);
		if (this.left){
			r=360-r;
		}
		if (r==360){
			r=0;
		}
		//var rotation = new THREE.Euler().setFromQuaternion(q);
		//console.log(r);
		//var abg = {alpha: evt.do.alpha, beta: evt.do.beta, gamma: evt.do.gamma};
		//console.log(abg);
		t.socket.emit('orientationEvent',r);
		//console.log(t.co.accelerometer);
		if (Math.abs(t.co.accelerometer.x)>10){
			console.log("hit");
			t.socket.emit('hitEvent',t.co.accelerometer.x);
		}
	}
}

var t = new TiltClient();
t.init();

function start(){
	var e = document.getElementById("code");
	var code = e.value;
	t.register(code);
}

var checked = false;
//Ancillary Functions
function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function submitAndCheck() {
	var noSleep = new NoSleep();
	noSleep.enable();
	sleep.prevent();
	var e = document.getElementById("code");
	if (e.value.length > 6){
		e.value=e.value.substring(0,6);
	}
	if (e.value.length==6){
		if (checked == false){
			checked = true;
			toggleFullScreen();
			//screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation || screen.orientation.lock;
			screen.orientation.lock("portrait-primary");
			start();
		}
	} else if (e.value.length < 6){
		checked = false;
		throwError("Invalid Code");
	}
}

function throwError(err){
	document.getElementById("codeerror").innerHTML = err;
}

function validate(e) {
	document.getElementById("code").value = document.getElementById("code").value.replace(/[^0-9]/g, '');
	if (isNaN(parseInt(String.fromCharCode(e.keyCode), 10))){
		e.preventDefault();
	}
}

function toggle(left){
	t.left = left;
	if (left){
		document.getElementById("r").className = "selected";
		document.getElementById("l").className = "";
	} else {
		document.getElementById("l").className = "selected";
		document.getElementById("r").className = "";
	}
}