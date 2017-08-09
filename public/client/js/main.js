function TiltClient() {
	this.gameStarted = false;

	this.init = function(){
		this.io = io();
		this.socket = io.connect();
		this.gameStarted = false;
	}

	this.showLoader = function(){
		document.getElementById("loader").style.display = "inherit";
	}

	this.hideLoader = function(){
		document.getElementById("loader").style.display = "none";
	}

	this.register = function(code){
		this.showLoader();
		if (!this.gameStarted){
			this.socket.emit('checkCode',code);
			var t = this;
			this.socket.on('addToGame', function(data){
				if (!t.gameStarted){
					if (data==1){
						t.startGame();
					} else {
						t.failedToAdd();
					}
				}
			});
		}
		this.hideLoader();
	}

	this.failedToAdd = function(){
		throwError("Invalid Code");
	}

	this.startGame = function(){
		console.log("game started");
		this.gameStarted = true;
	}
}

var t = new TiltClient();
t.init();

function start(){
	var e = document.getElementById("code");
	var code = e.value;
	t.register(code);
}

//Ancillary Functions
function submitAndCheck() {
	var e = document.getElementById("code");
	if (e.value.length > 6){
		e.value=e.value.substring(0,6);
	}
	if (e.value.length==6){
		start();
	} else if (e.value.length < 6){
		throwError("");
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