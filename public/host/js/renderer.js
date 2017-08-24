function Renderer(canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.fov = 250;
	this.points = [];
	this.obstacles = [];
	this.pointDensity = 500;
	this.divideBy = 1000000;
	this.scaleFactor = 0.015625;
	this.bg = "#fff";
	this.size = 5;
	this.obstaclesize = 20;
	this.obstaclecolour = "#d13030";
	this.xsize = 800;
	this.ysize = 700;
	this.zsize = 1200;
	this.emptyspaceradius = 200;
	this.obstacleradius = 150;
	this.circlex = 0;
	this.circley = 0;
	this.camerax = 0;
	this.cameray = 0;
	this.cameraz = 0;
	this.bladeAngle = 0;
	this.inHit = false;
	this.bladePos = {x:0,y:350};
	this.bladeDims = {width:20,height:600};
	this.oldBladeDims = {width:20,height:600};
	this.resizedBladeDims = {width:40,height:700};
	this.resizedBladeColour = "rgba(255, 0, 0, 1)";
	this.bladeRotatePos = {x:0,y:450};
	this.oldBladeColour = "rgba(255, 0, 0, 0.4)";
	this.bladeColour = "rgba(255, 0, 0, 0.4)";

	this.speed = 500;
	this.obstacleMinSpeed = 300;
	this.obstacleMaxSpeed = 800;
	this.lastUpdate = -1;
	this.lastHitUpdate = -1;
	this.hitTimer = 200;
	this.numPoints;

	this.getRandomInt = function(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	this.checkCoords = function(x,y){
		if (x*x+y*y<this.emptyspaceradius*this.emptyspaceradius){
			return false;
		}
		return true;
	}

	this.checkObstacleCoords = function(x,y){
		if (x*x+y*y>this.obstacleradius*this.obstacleradius){
			return false;
		}
		return true;
	}

	this.getRandomPoint = function(){
		var x = (Math.random()*this.xsize)-this.xsize/2;
		var y = (Math.random()*this.ysize)-this.ysize/2;
		while (!this.checkCoords(x,y)){
			x = (Math.random()*this.xsize)-this.xsize/2;
			y = (Math.random()*this.ysize)-this.ysize/2;
		}
		var z = (Math.random()*this.zsize)-this.zsize/2;
		return {"x":x,"y":y,"z":z};
	}

	this.getRandomObstaclePoint = function(){
		var x = (Math.random()*this.xsize)-this.xsize/2;
		var y = (Math.random()*-this.ysize/2);
		while (!this.checkObstacleCoords(x,y)){
			x = (Math.random()*this.xsize)-this.xsize/2;
			y = (Math.random()*this.ysize/2);
		}
		var z = this.zsize/2;
		return {"x":x,"y":y,"z":z};
	}

	this.drawBlade = function(){
		var HALF_WIDTH = this.canvas.width/2;
		var HALF_HEIGHT = this.canvas.height/2;
		var blx = this.bladePos.x-this.bladeDims.width/2+HALF_WIDTH;
		var bly = this.bladePos.y+HALF_HEIGHT;
		//console.log(blx);
		//console.log(bly);
		this.context.save();
		this.context.translate(this.bladeRotatePos.x+HALF_WIDTH,this.bladeRotatePos.y+HALF_HEIGHT);
		this.context.rotate(this.bladeAngle*Math.PI/180);
		this.context.translate(-1*(this.bladeRotatePos.x+HALF_WIDTH),-1*(this.bladeRotatePos.y+HALF_HEIGHT));
		this.context.beginPath();
		this.context.fillStyle = this.bladeColour;
		this.context.moveTo(blx,bly);
		this.context.lineTo(blx,bly-this.bladeDims.height);
		this.context.lineTo(blx+this.bladeDims.width,bly-this.bladeDims.height);
		this.context.lineTo(blx+this.bladeDims.width,bly);
		this.context.lineTo(blx,bly);
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	}

	this.drawPoint = function(point3d,obstacle=false){
		var HALF_WIDTH = this.canvas.width/2;
		var HALF_HEIGHT = this.canvas.height/2;
		x3d = point3d.x-this.camerax;
		y3d = point3d.y-this.cameray; 
		z3d = point3d.z-this.cameraz; 
		var scale = this.fov/(this.fov+z3d);
		var x2d = (x3d * scale) + HALF_WIDTH;	
		var y2d = (y3d * scale) + HALF_HEIGHT;
		var sizescale = scale*this.size;
		if (obstacle){
			sizescale=scale*this.obstaclesize;
		}
		this.context.lineWidth = sizescale;
		this.context.strokeStyle = point3d.colour;
		this.context.beginPath();
		this.context.moveTo(x2d,y2d); 
		this.context.lineTo(x2d+sizescale,y2d); 
		this.context.stroke(); 
	}

	this.drawCircle = function(point3d,obstacle=false){
		var HALF_WIDTH = this.canvas.width/2;
		var HALF_HEIGHT = this.canvas.height/2;
		x3d = point3d.x-this.camerax;
		y3d = point3d.y-this.cameray; 
		z3d = point3d.z-this.cameraz; 
		var scale = this.fov/(this.fov+z3d);
		var x2d = (x3d * scale) + HALF_WIDTH;	
		var y2d = (y3d * scale) + HALF_HEIGHT;
		this.context.beginPath();
		var sizescale = scale*this.size;
		if (obstacle){
			sizescale=scale*this.obstaclesize;
		}
		this.context.arc(x2d, y2d, sizescale/2, 0, 2 * Math.PI, false);
		this.context.fillStyle = point3d.colour;
		this.context.fill();
	}

	this.update = function(t){
		//console.log("update");
		if (t.lastUpdate==-1){
			t.lastUpdate = Date.now();
		}
		var delta = Date.now()-t.lastUpdate;
		var distanceToMove = delta/1000*t.speed;
		for (i=0; i<t.numPoints; i++) {
			var point3d = t.points[i]; 
			z3d = point3d.z; 
			z3d-=distanceToMove; 
			if(z3d<-t.fov) z3d+=t.zsize; 
			point3d.z = z3d; 
		}

		for (var j=0; j<t.obstacles.length; j++) {
			var point3d = t.obstacles[j]; 
			z3d = point3d.z; 
			var distanceToMove = delta/1000*point3d.speed;
			z3d-=distanceToMove;  
			point3d.z = z3d; 
			if(z3d<-t.fov) t.obstacles.splice(j,1);
		}
		t.render();
		t.lastUpdate = Date.now();
		requestAnimationFrame(function(){t.update(t)});
	}

	this.render = function(){
		this.canvas.width = window.innerWidth; 
  		this.canvas.height = window.innerHeight;
		this.context.fillStyle=this.bg;
	  	this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
		
		for (i=0; i<this.numPoints; i++) {
			var point3d = this.points[i];
			if (point3d.z>=-this.fov){
				this.drawCircle(point3d); 
			}
		}

		for (var j = 0; j<this.obstacles.length; j++){
			var point3d = this.obstacles[j];
			if (point3d.z>=-this.fov){
				this.drawCircle(point3d,true);
			}
		}

		this.drawBlade();
	}

	this.updateOrientation = function(orientation){
		if (!this.inHit){
			this.bladeAngle = orientation;
		}
	}

	this.endHit = function(t){
		var time = Date.now();
		t.lastHitUpdate = time;
		t.bladeDims = t.oldBladeDims;
		t.bladeColour = t.oldBladeColour;
		t.inHit = false;
		console.log("endHit");
	}

	this.hit = function(t, evt){
		console.log("hit");
		//if (t.canHit){
		var time = Date.now();
		if (time-t.lastHitUpdate>t.hitTimer+100){
			console.log("can hit");
			t.bladeDims = t.resizedBladeDims;
			t.bladeColour = t.resizedBladeColour;
			t.inHit = true;
			setTimeout(function(){t.endHit(t);},t.hitTimer);
		}
		//}
	}

	this.initPoints = function(){
		for (i=0; i<this.numPoints; i++) {
			var randcol = this.getRandomInt(0,220);
			randcol = randcol.toString();
			var c = "rgb("+randcol+","+randcol+","+randcol+")";
			var pts = this.getRandomPoint();
			//console.log(pts);
			//point = {x:(Math.random()*this.xsize)-this.xsize/2, y:(Math.random()*this.ysize)-this.ysize/2, z:(Math.random()*this.zsize)-this.zsize/2, colour:c};
			var point = {x:pts.x,y:pts.y,z:pts.z,colour:c};
			this.points.push(point); 
		}
	}

	this.newObstacle = function(t){
		var pts = this.getRandomObstaclePoint();
		var s = this.getRandomInt(this.obstacleMinSpeed,this.obstacleMaxSpeed);
		var point = {x:pts.x,y:pts.y,z:pts.z,colour:this.obstaclecolour,speed:s};
		this.obstacles.push(point);
		var time = this.getRandomInt(1000,2000);
		setTimeout(function(){t.newObstacle(t);},time);
	}

	this.init = function(){
		this.numPoints = this.pointDensity*this.xsize*this.ysize*this.zsize/this.divideBy*this.scaleFactor;
		this.initPoints(this.numPoints);
		//var t = this;
		//var loop = setInterval(function(){t.render();}, 50);
		var t = this;
		requestAnimationFrame(function(){t.update(t)});
		setTimeout(function(){t.newObstacle(t);},this.getRandomInt(1000,2000));
	}
}

function setup(){
	var canv = document.getElementById('canvas');
	var r = new Renderer(canv);
	r.init();
}
window.onload = setup;