//TODO: implement endGame socket listener

//Quaternion Functions (https://stackoverflow.com/questions/14167962/how-to-derive-standard-rotations-from-three-js-when-using-quaternions)
// Pass the obj.quaternion that you want to convert here:
//*********************************************************
function quatToEuler (q1) {
    var pitchYawRoll = new THREE.Vector3();
     sqw = q1.w*q1.w;
     sqx = q1.x*q1.x;
     sqy = q1.y*q1.y;
     sqz = q1.z*q1.z;
     unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
     test = q1.x*q1.y + q1.z*q1.w;
    if (test > 0.499*unit) { // singularity at north pole
        heading = 2 * Math.atan2(q1.x,q1.w);
        attitude = Math.PI/2;
        bank = 0;
        return;
    }
    if (test < -0.499*unit) { // singularity at south pole
        heading = -2 * Math.atan2(q1.x,q1.w);
        attitude = -Math.PI/2;
        bank = 0;
        return;
    }
    else {
        heading = Math.atan2(2*q1.y*q1.w-2*q1.x*q1.z , sqx - sqy - sqz + sqw);
        attitude = Math.asin(2*test/unit);
        bank = Math.atan2(2*q1.x*q1.w-2*q1.y*q1.z , -sqx + sqy - sqz + sqw)
    }
    pitchYawRoll.z = Math.floor(attitude * 1000) / 1000;
    pitchYawRoll.y = Math.floor(heading * 1000) / 1000;
    pitchYawRoll.x = Math.floor(bank * 1000) / 1000;

    return pitchYawRoll;
}        

// Then, if I want the specific yaw (rotation around y), I pass the results of
// pitchYawRoll.y into the following to get back the angle in radians which is
// what can be set to the object's rotation.

//*********************************************************
function eulerToAngle(rot) {
    var ca = 0;
    if (rot > 0)
        { ca = (Math.PI*2) - rot; } 
    else 
        { ca = -rot }

    return (ca / ((Math.PI*2)/360));  // camera angle radians converted to degrees
}

function TiltClient() {
	this.noCode = true;
	this.gameStarted = false;

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

	this.startGame = function(){
		console.log("game started");
		this.gameStarted = true;
		document.getElementById("logincontainer").className = "animate-top";
		this.hideLoader();
		document.getElementById("gamecontainer").style.display = "inherit";
		var t = this;
		var timer = setInterval(function(){t.handleDeviceOrientation(t);},16);
	}

	this.handleDeviceOrientation = function(t){
		var q = t.co.getOrientation();
		var rotation = quatToEuler(q);
		var r = eulerToAngle(rotation.x);
		//var rotation = new THREE.Euler().setFromQuaternion(q);
		console.log(r);
		//var abg = {alpha: evt.do.alpha, beta: evt.do.beta, gamma: evt.do.gamma};
		//console.log(abg);
		t.socket.emit('orientationEvent',r);
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