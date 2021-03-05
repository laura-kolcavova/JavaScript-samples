//Functions
///////////////////////////////////////

function AABBIntersect(ax, ay, aw, ah, bx, by, bw, bh)
{
	return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
}

function getRandom(min, max)
{
	var r = Math.floor(Math.random() * (max - min + 1) + min);
	return r;
}

Array.prototype.contains = function(obj)
{
	var i = 0;
	while(i < this.length)
	{
		if(this[i] === obj) return true;
		i++;
	}
	return false;
}

//Helpers
///////////////////////////////////////

function Screen(width, height, id)
{
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.w = width;
	this.canvas.height = this.h = height;
	this.canvas.id = id;

	this.ctx = this.canvas.getContext("2d");

	document.body.appendChild(this.canvas);
}

function MouseHandler()
{
	this.x = null;
	this.y = null;
	this.down = false;

	this.pushed = false; //for onClick

	var self = this;
	game.mCanvas.canvas.addEventListener("mousemove", function(e){
		self.x = e.clientX - this.offsetLeft;
		self.y = e.clientY - this.offsetTop;
	});

	game.mCanvas.canvas.addEventListener("mousedown", function(e){

		self.down = true;
	});

	game.mCanvas.canvas.addEventListener("mouseup", function(e){

		self.down = false;
	});
}

MouseHandler.prototype.clicked = function()
{
	if(this.down) this.pushed = true;

	if(this.pushed && !this.down)
	{
		this.pushed = false;
		return true;
	}
	else return false;
}

MouseHandler.prototype.draw = function(ctx)
{
	imageManager.s_cursor.draw(this.x - (Math.round(cg.cw / 2)), this.y - (Math.round(cg.ch / 2)), ctx);
}


function Button(text, font, color, method, args)
{
	this.text = text;
	this.font = font;
	this.color = color;
	this.method = method;
	this.args = args;

	this.hoover = false;
	this.pushed = false;

	this.init = function(x, y, w, h)
	{
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	this.update = function()
	{
		if(AABBIntersect(Mouse.x, Mouse.y, 0, 0, this.x, this.y, this.w, this.h))
		{
			this.hoover = true;

			if(Mouse.down && !this.pushed)
			{
				this.pushed = true;
			}

			if(!Mouse.down && this.pushed)
			{
				this.pushed = false;
				this.method.apply(this, this.args);
			}
		}
		else
		{
			this.hoover = false;
			this.pushed = false;
		}
	};

	this.draw = function(ctx)
	{
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.w, this.h);

		if(this.pushed)
		{
			ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			ctx.fillRect(this.x, this.y, this.w, this.h);
		}

		ctx.font = this.font;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "black";
		ctx.fillText(this.text, this.x + this.w/2, this.y + this.h/2);
	};
}

//Functions for buttons
////////////////////////////////////

function b_setRandomlyShips()
{
	game.currentPlayer.setRandomlyShips();
	game.selectedShip = null;
	game.currentPlayer.map.collisionShips = [];
}

function b_turnShip()
{
	if(game.selectedShip !== null) 
	{
		game.selectedShip.turn();
		game.currentPlayer.map.checkCollisionOfShips();
	}
}

function b_finishInit()
{
	if(game.state === game.states.InitPlayer)
	{
		game.selectedShip = null;
	}
	game.finishInit();
}

function b_startGame(arg)
{
	game.startGame(arg);
}