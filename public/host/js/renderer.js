function Renderer(canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.fov = 250;
	this.points = [];
	this.pointDensity = 500;
	this.divideBy = 1000000;
	this.scaleFactor = 0.015625;
	this.bg = "#fff";
	this.size = 5;
	this.xsize = 800;
	this.ysize = 600;
	this.zsize = 1200;
	this.emptyspaceradius = 200;
	this.circlex = 0;
	this.circley = 0;
	this.camerax = 0;
	this.cameray = 50;
	this.cameraz = 0;

	this.speed = 500;
	this.lastUpdate = -1;
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

	this.drawPoint = function(point3d){
		var HALF_WIDTH = this.canvas.width/2;
		var HALF_HEIGHT = this.canvas.height/2;
		x3d = point3d.x-this.camerax;
		y3d = point3d.y-this.cameray; 
		z3d = point3d.z-this.cameraz; 
		var scale = this.fov/(this.fov+z3d);
		var x2d = (x3d * scale) + HALF_WIDTH;	
		var y2d = (y3d * scale) + HALF_HEIGHT;
		var sizescale = scale*this.size;
		this.context.lineWidth = sizescale;
		this.context.strokeStyle = point3d.colour;
		this.context.beginPath();
		this.context.moveTo(x2d,y2d); 
		this.context.lineTo(x2d+sizescale,y2d); 
		this.context.stroke(); 
	}

	this.drawCircle = function(point3d){
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
		this.context.arc(x2d, y2d, sizescale/2, 0, 2 * Math.PI, false);
		this.context.fillStyle = point3d.colour;
		this.context.fill();
	}

	this.initPoints = function(){
		for (i=0; i<this.numPoints; i++) {
			var randcol = this.getRandomInt(0,220);
			randcol = randcol.toString();
			var c = "rgb("+randcol+","+randcol+","+randcol+")";
			var pts = this.getRandomPoint();
			//console.log(pts);
			//point = {x:(Math.random()*this.xsize)-this.xsize/2, y:(Math.random()*this.ysize)-this.ysize/2, z:(Math.random()*this.zsize)-this.zsize/2, colour:c};
			point = {x:pts.x,y:pts.y,z:pts.z,colour:c};
			this.points.push(point); 
		}
	}

	this.update = function(t){
		console.log("update");
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
	}

	this.init = function(){
		this.numPoints = this.pointDensity*this.xsize*this.ysize*this.zsize/this.divideBy*this.scaleFactor;
		this.initPoints(this.numPoints);
		//var t = this;
		//var loop = setInterval(function(){t.render();}, 50);
		var t = this;
		requestAnimationFrame(function(){t.update(t)});
	}
}

function setup(){
	var canv = document.getElementById('canvas');
	var r = new Renderer(canv);
	r.init();
}
window.onload = setup;