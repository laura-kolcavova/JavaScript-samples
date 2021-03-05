var WIDTH = 250, HEIGHT = 350, cw = 25, ch = 25;
var MapW = WIDTH / cw, MapH = HEIGHT / ch;
var MapCanvas, NxBlCanvas, input;
var UP_KEY = 38, RIGHT_KEY = 39, DOWN_KEY = 40, LEFT_KEY = 37;
var game;

window.onload = function() 
{
	main();
}

function main()
{
	MapCanvas = new Screen(WIDTH, HEIGHT, "MapCanvas", "#wrapper");
	NxBlCanvas = new Screen(0, 0, "NxBlCanvas", "#nextBlock .box");

	input = new InputHandeler()
	game = new Game();

	game.init();
	window.requestAnimationFrame(loop);
}

function loop()
{
	if(game.alive == true)
	{
		update();
		render();

		window.requestAnimationFrame(loop);
	}
	else
	{
		//game over - stop loop 
		document.querySelector("#gameOver").style.display = "block";
		document.querySelector("#gameOver #restart").onclick = function()
		{
			game.restart();
		}
	}
}

function update()
{
	game.frames ++;

		var aBlock = game.aktivniBlock;

		//klavesy
		if(input.isDown(LEFT_KEY) && game.frames % 5 == 0)
		{
			if(!game.checkCollision(aBlock, -cw, 0)) aBlock.posun(-cw, 0);
		}
		else
		if(input.isDown(RIGHT_KEY) && game.frames % 5 == 0)
		{
			if(!game.checkCollision(aBlock, cw, 0)) aBlock.posun(cw, 0);
		}
		else
		if(input.isDown(DOWN_KEY) && game.frames % 5 == 0)
		{
			if(!game.checkCollision(aBlock, 0, ch)) aBlock.posun(0, ch);
		}
		else
		if(input.isPressed(UP_KEY))
		{
			aBlock.rotate90();
			if(game.checkCollision(aBlock, 0, 0))
			{
				for(var i = 0; i < aBlock.maxNumRot-1; i++) aBlock.rotate90();
			}
		}
		
		//automaticke posunuti dolu
		if(game.frames % (game.lvFrame - game.level*2) == 0)
		{
			game.frames = 0;

			
			if(!game.checkCollision(aBlock, 0, ch))
			{
				aBlock.posun(0, ch);
			}
			else
			{
				var aBlckCoors = aBlock.getTheHighestCoors();
				if(aBlckCoors.y <= 0) //konec hry
				{
					game.alive = false;
					return;
				}

				//score += y line of set
				game.scoreUp(MapH - Math.floor(aBlckCoors.y/ch));

				game.addBlock(aBlock);
				game.dropBlocksDown();

				game.aktivniBlock = game.nasledujiciBlock;
				game.aktivniBlock.setSouradnice(100, -50);

				game.nasledujiciBlock = createNextBlock();
			}
		}
}

function render()
{
	//Vykreslení mapy
	MapCanvas.ctx.fillStyle = "#AEE2E8";
	MapCanvas.ctx.fillRect(0,0,WIDTH, HEIGHT);

	//Vykreslení bloků
	game.aktivniBlock.draw(MapCanvas);
	for(var i in game.blocks) game.blocks[i].draw(MapCanvas);


	//Vykreslení nálsedujícího bloku
	NxBlCanvas.ctx.fillStyle = "#AEE2E8";
	NxBlCanvas.ctx.fillRect(0, 0, NxBlCanvas.width, NxBlCanvas.height);
	game.nasledujiciBlock.draw(NxBlCanvas);

	//Vykreslení score
	document.querySelector("#scoreText").innerHTML = game.score;

	//level
	document.querySelector("#levelText").innerHTML = game.level;
}

//////////////////
/////////////////

function Game()
{
	this.init = function()
	{
		this.score = 0;
		this.level = 1;
		this.frames = 0;
		this.lvFrame = 22;
		this.blocks = [];
		this.alive = true;
	
		this.aktivniBlock = createBlock();
		this.nasledujiciBlock = createNextBlock();
	};

	this.addBlock = function(blok)
	{
		this.blocks.push(blok);
	};

	this.checkCollision = function(conBlock, nx, ny)
	{
		for(var i in conBlock.kostky)
		{
			var ax = conBlock.kostky[i].x+nx;
			var ay = conBlock.kostky[i].y+ny;

			if(!(ax+cw > WIDTH || ax < 0 || ay+ch > HEIGHT))
			{
				for(var j in this.blocks)
				{
					for(var k in this.blocks[j].kostky)
					{
						var bx = this.blocks[j].kostky[k].x;
						var by = this.blocks[j].kostky[k].y;
						if(AABBIntersect(ax, ay, bx, by, cw, ch)) return true;
					}
				}
			}
			else return true;
		}

		return false;
	};

	this.dropBlocksDown = function()
	{
		var setSquares;
		var indexOfLayer;

		for(var my = 0; my < MapH; my++)
		{
			setSquares = [];
			indexOfLayer = my * ch;

			for(var i in this.blocks)
			{
				for(var j in this.blocks[i].kostky)
				{
					if(my*ch == this.blocks[i].kostky[j].y)
					{
						setSquares.push(this.blocks[i].kostky[j]);

						if(setSquares.length == MapW)
						{
							for(var k in setSquares) deleteSquare(setSquares[k]);
							this.posunBlokyDleIndexu(indexOfLayer);

							this.scoreUp(10 * (MapH-my));
							this.dropBlocksDown();
							return;
						}
					}
				}
			}

		}
	};

	this.posunBlokyDleIndexu = function(index)
	{
		for(var i in this.blocks)
		{
			for(var j in this.blocks[i].kostky)
			{
				if(this.blocks[i].kostky[j].y < index)
				{
					this.blocks[i].kostky[j].y += ch;
				}
			}
		}

	};

	this.scoreUp = function(num)
	{
		this.score += num;

		if(this.score >= 150  && this.level == 1) this.level ++;
		if(this.score >= 300  && this.level == 2) this.level ++;
		if(this.score >= 600  && this.level == 3) this.level ++;
		if(this.score >= 1200 && this.level == 4) this.level ++;
	};

	this.restart = function()
	{
		document.querySelector("#gameOver").style.display = "none";
		this.init();
		loop();
	}
}

function Block(type)
{
	this.color;
	this.kostky;
	this.type = type;
	this.rotate;
	this.numRot = 0;
	this.maxNumRot;

	switch(this.type)
	{
		case 0:
		{
			//####
			this.setSouradnice = function(mx, my)
			{
				this.kostky = [
					{x:mx, y:my}, {x:mx+cw, y:my},
					{x:mx+2*cw, y:my}, {x:mx+3*cw, y:my},
				];
			}

			this.color = "cyan";
			this.maxNumRot = 2;

			this.rotate = function(indexRot)
			{
				switch(indexRot)
				{
					case 1:
					{
						this.kostky[0] = {x:this.kostky[0].x+2*cw, y:this.kostky[0].y-2*ch};
						this.kostky[1] = {x:this.kostky[1].x+cw, y:this.kostky[1].y-ch};
						this.kostky[3] = {x:this.kostky[3].x-cw, y:this.kostky[3].y+ch};
						break;
					}
					case 0:
					{
						this.kostky[0] = {x:this.kostky[0].x-2*cw, y:this.kostky[0].y+2*ch};
						this.kostky[1] = {x:this.kostky[1].x-cw, y:this.kostky[1].y+ch};
						this.kostky[3] = {x:this.kostky[3].x+cw, y:this.kostky[3].y-ch};
						break;
					}
				}
			}
			break;
		}
		case 1:
		{
			//#
			//###
			this.setSouradnice = function(mx, my)
			{
				this.kostky = [
					{x:mx, y:my}, {x:mx, y:my+ch},
					{x:mx+cw, y:my+ch}, {x:mx+2*cw, y:my+ch},
				];
			}

			this.color = "blue";
			this.maxNumRot = 4;

			this.rotate = function(indexRot)
			{
				switch(indexRot)
					{
						case 1:
						{
							this.kostky[0] = {x:this.kostky[0].x+2*cw, y:this.kostky[0].y};
							this.kostky[1] = {x:this.kostky[1].x+cw, y:this.kostky[1].y-ch};
							this.kostky[3] = {x:this.kostky[3].x-cw, y:this.kostky[3].y+ch};
							break;
						}
						case 2:
						{
							this.kostky[0] = {x:this.kostky[0].x, y:this.kostky[0].y+2*ch};
							this.kostky[1] = {x:this.kostky[1].x+cw, y:this.kostky[1].y+ch};
							this.kostky[3] = {x:this.kostky[3].x-cw, y:this.kostky[3].y-ch};
							break;
						}
						case 3:
						{
							this.kostky[0] = {x:this.kostky[0].x-2*cw, y:this.kostky[0].y};
							this.kostky[1] = {x:this.kostky[1].x-cw, y:this.kostky[1].y+ch};
							this.kostky[3] = {x:this.kostky[3].x+cw, y:this.kostky[3].y-ch};
							break;
						}
						case 0:
						{
							this.kostky[0] = {x:this.kostky[0].x, y:this.kostky[0].y-2*ch};
							this.kostky[1] = {x:this.kostky[1].x-cw, y:this.kostky[1].y-ch};
							this.kostky[3] = {x:this.kostky[3].x+cw, y:this.kostky[3].y+ch};
							break;
						}
					}
			}
			break;
		}
		case 2:
		{
			//  #
			//###
			this.setSouradnice = function(mx, my)
			{
				this.kostky = [
					{x:mx+2*cw, y:my}, {x:mx, y:my+ch},
					{x:mx+cw, y:my+ch}, {x:mx+2*cw, y:my+ch},
				];
			}

			this.color = "orange";
			this.maxNumRot = 4;

			this.rotate = function(indexRot)
			{
				switch(indexRot)
				{
					case 1:
					{
						this.kostky[0] = {x:this.kostky[0].x, y:this.kostky[0].y+2*ch};
						this.kostky[1] = {x:this.kostky[1].x+cw, y:this.kostky[1].y-ch};
						this.kostky[3] = {x:this.kostky[3].x-cw, y:this.kostky[3].y+ch};
						break;
					}
					case 2:
					{
						this.kostky[0] = {x:this.kostky[0].x-2*cw, y:this.kostky[0].y};
						this.kostky[1] = {x:this.kostky[1].x+cw, y:this.kostky[1].y+ch};
						this.kostky[3] = {x:this.kostky[3].x-cw, y:this.kostky[3].y-ch};
						break;
					}
					case 3:
					{
						this.kostky[0] = {x:this.kostky[0].x, y:this.kostky[0].y-2*ch};
						this.kostky[1] = {x:this.kostky[1].x-cw, y:this.kostky[1].y+ch};
						this.kostky[3] = {x:this.kostky[3].x+cw, y:this.kostky[3].y-ch};
						break;
					}
					case 0:
					{
						this.kostky[0] = {x:this.kostky[0].x+2*cw, y:this.kostky[0].y};
						this.kostky[1] = {x:this.kostky[1].x-cw, y:this.kostky[1].y-ch};
						this.kostky[3] = {x:this.kostky[3].x+cw, y:this.kostky[3].y+ch};
						break;
					}
				}
			}
			break;
		}
		case 3:
		{
			//##
			//##
			this.setSouradnice = function(mx, my)
			{
				this.kostky = [
					{x:mx, y:my}, {x:mx+cw, y:my},
					{x:mx, y:my+ch}, {x:mx+cw, y:my+ch},
				];
			}

			this.color = "yellow";
			this.maxNumRot = 0;

			this.rotate = function(indexRot) {};

			break;
		}
		case 4:
		{
			// #
			//###
			this.setSouradnice = function(mx, my)
			{
				this.kostky = [
					{x:mx+cw, y:my}, {x:mx, y:my+ch},
					{x:mx+cw, y:my+ch}, {x:mx+2*cw, y:my+ch},
				];
			}

			this.color = "purple";
			this.maxNumRot = 4;

			this.rotate = function(indexRot)
			{
				switch(indexRot)
				{
					case 1:
					{
						this.kostky[0] = {x:this.kostky[0].x+cw, y:this.kostky[0].y+ch};
						this.kostky[1] = {x:this.kostky[1].x+cw, y:this.kostky[1].y-ch};
						this.kostky[3] = {x:this.kostky[3].x-cw, y:this.kostky[3].y+ch};
						break;
					}
					case 2:
					{
						this.kostky[0] = {x:this.kostky[0].x-cw, y:this.kostky[0].y+ch};
						this.kostky[1] = {x:this.kostky[1].x+cw, y:this.kostky[1].y+ch};
						this.kostky[3] = {x:this.kostky[3].x-cw, y:this.kostky[3].y-ch};
						break;
					}
					case 3:
					{
						this.kostky[0] = {x:this.kostky[0].x-cw, y:this.kostky[0].y-ch};
						this.kostky[1] = {x:this.kostky[1].x-cw, y:this.kostky[1].y+ch};
						this.kostky[3] = {x:this.kostky[3].x+cw, y:this.kostky[3].y-ch};
						break;
					}
					case 0:
					{
						this.kostky[0] = {x:this.kostky[0].x+cw, y:this.kostky[0].y-ch};
						this.kostky[1] = {x:this.kostky[1].x-cw, y:this.kostky[1].y-ch};
						this.kostky[3] = {x:this.kostky[3].x+cw, y:this.kostky[3].y+ch};
						break;
					}
				}
			}
			break;
		}
		case 5:
		{
			//##
			// ##
			this.setSouradnice = function(mx, my)
			{
				this.kostky = [
					{x:mx, y:my}, {x:mx+cw, y:my},
					{x:mx+cw, y:my+ch}, {x:mx+2*cw, y:my+ch},
				];
			}

			this.color = "lime";
			this.maxNumRot = 2;

			this.rotate = function(indexRot)
			{
				switch(indexRot)
				{
					case 1:
					{
						this.kostky[0] = {x:this.kostky[0].x+2*cw, y:this.kostky[0].y};
						this.kostky[1] = {x:this.kostky[1].x+cw,    y:this.kostky[1].y+ch};
						this.kostky[3] = {x:this.kostky[3].x-cw, y:this.kostky[3].y+ch};
						break;
					}
					case 0:
					{
						this.kostky[0] = {x:this.kostky[0].x-2*cw, y:this.kostky[0].y};
						this.kostky[1] = {x:this.kostky[1].x-cw,   y:this.kostky[1].y-ch};
						this.kostky[3] = {x:this.kostky[3].x+cw,   y:this.kostky[3].y-ch};
						break;
					}
				}
			}
			break;
		}
		case 6:
		{
			// ##
			//##
			this.setSouradnice = function(mx, my)
			{
				this.kostky = [
					{x:mx+cw, y:my}, {x:mx+2*cw, y:my},
					{x:mx, y:my+ch}, {x:mx+cw, y:my+ch},
				];
			}

			this.color = "red";
			this.maxNumRot = 2;

			this.rotate = function(indexRot)
			{
				switch(indexRot)
				{
					case 1:
					{
						this.kostky[0] = {x:this.kostky[0].x+cw, y:this.kostky[0].y+ch};
						this.kostky[1] = {x:this.kostky[1].x,    y:this.kostky[1].y+2*ch};
						this.kostky[2] = {x:this.kostky[2].x+cw, y:this.kostky[2].y-ch};
						break;
					}
					case 0:
					{
						this.kostky[0] = {x:this.kostky[0].x-cw, y:this.kostky[0].y-ch};
						this.kostky[1] = {x:this.kostky[1].x,    y:this.kostky[1].y-2*ch};
						this.kostky[2] = {x:this.kostky[2].x-cw, y:this.kostky[2].y+ch};
						break;
					}
				}
			}
			break;
		}
	};
	this.setSouradnice(100, -50);

	this.draw = function(platno)
	{
		platno.ctx.fillStyle = this.color;
		platno.ctx.strokeStyle = "black";
		for(var i = 0; i < this.kostky.length; i++)
		{
			var nx = this.kostky[i].x, ny = this.kostky[i].y;
			platno.ctx.fillRect(nx, ny, cw, ch);
			platno.ctx.strokeRect(nx, ny, cw, ch);
		}
	};

	this.posun = function(nx, ny)
	{
		for(var i in this.kostky)
		{
			this.kostky[i].x += nx;
			this.kostky[i].y += ny;
		}
	};

	this.rotate90 = function()
	{
		this.numRot++;
		if(this.numRot % this.maxNumRot == 0) this.numRot = 0;
		this.rotate(this.numRot);
	};

	this.getTheHighestCoors = function()
	{
		var coors;

		for(var i in this.kostky)
		{
			if(coors != null)
			{
				if(this.kostky[i].x > coors.x) coors.x = this.kostky[i].x;
				if(this.kostky[i].y > coors.y) coors.y = this.kostky[i].y;
			}
			else
			{
				coors = {x:this.kostky[i].x, y: this.kostky[i].y};
			}
		}

		return coors;
	}
}

/////
/////

function AABBIntersect(ax, ay, bx, by, cw, ch)
{
	return ax < bx+cw && ay < by+ch && bx < ax+cw && by < ay+ch;
}

function createBlock()
{
		var r = Math.floor(Math.random()*7);
		return new Block(r);
}

function createNextBlock()
{
	var block = createBlock();
	block.setSouradnice(0, 0);

	var highCoors = block.getTheHighestCoors();

	NxBlCanvas.canvas.width = NxBlCanvas.width = highCoors.x + cw;
	NxBlCanvas.canvas.height = NxBlCanvas.height = highCoors.y + ch;

	return block;
}

function InputHandeler() {
	this.down = {};
	this.pressed = {};

	var _this = this;
	document.addEventListener("keydown", function(evt){
		_this.down[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt){
		delete _this.down[evt.keyCode];
		delete _this.pressed[evt.keyCode];
	});
};

InputHandeler.prototype.isDown = function(code) {
	return this.down[code];
};

InputHandeler.prototype.isPressed = function(code) {
	if(this.pressed[code]) {
		return false;
	}
	else
	{
		if(this.down[code])
		{
			return this.pressed[code] = true;
		}
	}

	return false;
};

function deleteSquare(square)
{
	for(var i in game.blocks)
	{
		for(var j in game.blocks[i].kostky)
		{
			if(square == game.blocks[i].kostky[j]) game.blocks[i].kostky.splice(j,1);
		}
		if(game.blocks[i].kostky == null) game.blocks.splice(i, 1);
	}
}

function Screen(width, height, id, element)
{
	this.canvas = document.createElement("canvas");

	this.canvas.id = id;
	this.canvas.width = this.width = width;
	this.canvas.height = this.height = height;

	this.ctx = this.canvas.getContext("2d");
	document.querySelector(element).appendChild(this.canvas);
}