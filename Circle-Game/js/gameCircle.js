var canvas, game, cursor;
var lastLoop, thisLoop, fps = [], avgFps = 0;

window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           function( callback ){
           window.setTimeout(callback, 1000 / 60);
          };
})();

window.onload = function()
{
	main();
}

function main()
{
	var w = window.innerWidth;
	var h = window.innerHeight;
	canvas = new Screen(w, h, "canvas");
	cursor = new CursorListener();

	game = new Game();

	game.init();

	lastLoop = new Date();
	loop();
}

function loop()
{
	getFps();

	update();
	render();

	requestAnimFrame(loop);
}

function update()
{
	game.frames ++;

	//Responzivita
	game.checkResponsible();

	//generate circles
	if(game.frames % 2 === 0 && game.circles.length < game.maxCircles) 
	{
			game.generateCircle();
	}

	//FPS
	if(game.frames % 5 === 0) avgFps = Math.round(fps.avg());

	//update circles
	if(game.state === game.states.Game) game.player.update();
	game.updateCircles();

	if(game.frames === 100) game.frames = 0;
}

function render()
{
	canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

	game.drawCircles();

	if(game.state === game.states.Game)
	{
		game.player.draw();

		canvas.ctx.font="22px Cambira";
		canvas.ctx.fillStyle = 'orange';
		canvas.ctx.fillText("Score: " + game.score , canvas.width - 120, 25);
	}

	canvas.ctx.font="18px Cambira";
	canvas.ctx.fillStyle = 'orange';
	canvas.ctx.fillText("FPS: " + avgFps, 20, 25);
}

//Tridy
/////////////////////////////////////////////////////
function Game()
{
	this.colors = ["yellow", "red", "orangeRed", "blue", "lime"];
	this.states = {"Start": 0, "Game": 1, "End": 2};
	this.state = this.states.Start;
	this.minSpeed = 1.5; //min speed of Circle

	this.init = function()
	{
		this.circles = [];
		this.score = 0;
		this.frames = 0;
		this.maxCircles = this.getMaxCountOfCircles();
		this.min = 5; //min radius of circle
		this.max = 55; //max radius of circle

		this.player = new Player(canvas.width/2, canvas.width/2, 10, "white");

		console.log("circles: " + this.maxCircles);
	}

	this.generateCircle = function()
	{
		var min = (this.min < this.player.r - 35) ? this.player.r-35 : this.min;
		var max = (this.max < this.player.r + 15) ? this.player.r+15 : this.max;
		var r = getRandom(min, max);

		var color = this.colors[getRandom(0, this.colors.length-1)];
		var x, dirX;
		var y, dirY;

		//random position, direction
		switch(getRandom(0, 3))
		{
			case 0: //left
			{
				x = 0 - r;
				y = getRandom(0, canvas.height);
				dirX = 1;
				dirY = getRandom(-1, 1);
				break;
			}
			case 1: //right
			{
				x = canvas.width + r;
				y = getRandom(0, canvas.height);
				dirX = -1;
				dirY = getRandom(-1, 1);
				break;
			}
			case 2: //top
			{
				x = getRandom(0, canvas.width);
				y = 0 - r;
				dirX = getRandom(-1, 1);
				dirY = 1;
				break;
			}
			case 3: //bottom
			{
				x = getRandom(0, canvas.width);
				y = canvas.height + r;
				dirX = getRandom(-1, 1);
				dirY = -1;
				break;
			}
		}

		var velX = (this.minSpeed + (getRandom(0, 10) / 10)) * dirX;
		var velY = (this.minSpeed + (getRandom(0, 10) / 10)) * dirY;

		var circle = new Circle(x, y, r, velX, velY, color);
		this.circles.push(circle);
	};

	this.drawCircles = function()
	{
		var i = 0;
		for(""; i < this.circles.length; i++) this.circles[i].draw();
	};

	this.updateCircles = function()
	{
		var player = this.player;

		var i = 0;
		for(""; i < this.circles.length; i++)
		{
			var c = this.circles[i];

			c.update();

			//detekce kolize
			if(this.state === this.states.Game)
			{
				if(collision(player.x, player.y, player.r, c.x, c.y, c.r))
				{
					if(player.r >= c.r)
					{
						player.swallow(c);
					}
					else
					{
						this.gameOver();
						return;
					}
				}
			}

			//exterminate the circle!
			if(!c.alive)
			{
				this.circles.splice(i, 1);
				i--;
			}
		}
	};

	this.gameOver = function()
	{
		this.state = this.states.End;

		document.getElementById("gameOver").style.display = "block";
		document.getElementById("score").innerHTML = game.score;
	};

	this.start = function()
	{
		this.init();
		this.state = this.states.Game;
	};

	this.checkResponsible = function() //autosize
	{
		var w = window.innerWidth;
		var h = window.innerHeight;

		if(w !== canvas.width || h !== canvas.height)
		{
			canvas.width = canvas.canvas.width = w;
			canvas.height = canvas.canvas.height = h;

			this.maxCircles = this.getMaxCountOfCircles();
			console.log("Area changed - circles: " + this.maxCircles);
		}
	};

	this.getMaxCountOfCircles = function()
	{
		return Math.round(canvas.width * canvas.height / (10 * 1000) / 1.65);
	};
}

function Circle(x, y, r, velX, velY, color)
{
	this.x = x;
	this.y = y;
	this.r = r;
	this.velX = velX;
	this.velY = velY;
	this.color = color;
	this.alive = true;
}

Circle.prototype.update = function()
{
		this.x += this.velX;
		this.y += this.velY;

		if(this.x - this.r > canvas.width  || this.x + this.r < 0 ||
		   this.y - this.r > canvas.height || this.y + this.r < 0) this.alive = false;
}

Circle.prototype.draw = function()
{
		canvas.ctx.beginPath();
		canvas.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
		canvas.ctx.fillStyle = this.color;
		canvas.ctx.closePath();
		canvas.ctx.fill();
}


function Player(x, y, r, color)
{
	Circle.call(this, x, y, r, 0, 0, color);

	this.update = function()
	{
		this.x = cursor.x;
		this.y = cursor.y;

		if(this.x < 0) this.x = 0;
		if(this.y < 0) this.y = 0;
		if(this.x > canvas.width) this.x = canvas.width;
		if(this.y > canvas.height) this.y = canvas.height;
	};

	this.swallow = function(circle)
	{
		this.r ++; //Math.round(circle.r/8);

		circle.alive = false;

		game.score ++;
	}
}
Player.prototype = Object.create(Circle.prototype);
Player.prototype.constructor = Player;

//HELPERS
///////////////////////////

function Screen(width, height, id)
{
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.width = width;
	this.canvas.height = this.height = height;
	this.canvas.id = id;

	this.ctx = this.canvas.getContext("2d");

	document.body.appendChild(this.canvas);
}

function CursorListener()
{
	this.x = canvas.width/2;
	this.y = canvas.height/2;

	var self = this;
	document.addEventListener("mousemove", function(evt){
		self.x = evt.clientX - canvas.canvas.offsetLeft;
		self.y = evt.clientY - canvas.canvas.offsetTop;
	});
}

//Funkce
///////////////////////////////////////////////////
function getRandom(min, max)
{
	var r = Math.floor(Math.random() * (max - min + 1) + min);
	return r;
}

function collision (p1x, p1y, r1, p2x, p2y, r2) {
    var a;
    var x;
    var y;

    a = r1 + r2;
    x = p1x - p2x;
    y = p1y - p2y;

    if ( a > Math.sqrt( (x*x) + (y*y) ) ) {
        return true;
    } else {
        return false;
    }   
}

var index = 0;
function getFps()
{
	thisLoop = new Date();
	var sfps = 1000 / (thisLoop - lastLoop);
	lastLoop = thisLoop;

	if(index >= 5) index = 0;
	
	fps[index] = sfps;
	index++;
}

Array.prototype.avg = function() 
{
	var len = this.length;
	if(len === 0) return 0;

	var sum = 0;

	for(var i = 0; i < len; i++)
	{
		sum += this[i];
	}

	return sum/len;
}

document.getElementById("restart").onclick = function()
 {
 	game.start();
 	document.getElementById("gameOver").style.display = "none";
 };

 document.getElementById("start").onclick = function()
 {
 	game.start();
 	document.getElementById("gameStart").style.display = "none";
 }