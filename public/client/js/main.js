function TiltClient() {
	this.noCode = true;
	this.gameStarted = false;

	this.init = function(){
		this.io = io();
		this.socket = io.connect();
		this.noCode = true;
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

	this.startGame = function(){
		console.log("game started");
		this.gameStarted = true;
		document.getElementById("logincontainer").className = "animate-top";
		this.hideLoader();
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
function submitAndCheck() {
	var e = document.getElementById("code");
	if (e.value.length > 6){
		e.value=e.value.substring(0,6);
	}
	if (e.value.length==6){
		if (checked == false){
			checked = true;
			start();
		}
	} else if (e.value.length < 6){
		checked = false;
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