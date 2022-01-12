var mCanvas, game, requestId;
var Mouse, imageRepository;

window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           function( callback ){
           window.setTimeout(callback, 1000 / 60);
          };
})();

function main()
{
	mCanvas = new Screen(400, 400, "mainCanvas");

	Mouse = new MouseHandler();
	game = new Game();

	imageRepository = new ImageRepository();
	imageRepository.init(i_sheetUrl);
}

function loop()
{
	game.update();
	game.render();

	requestId = requestAnimFrame(loop);
}

//Classes
/////////////////////
function Game()
{
	this.states = {
		Game: 0,
		End: 1,
	};
	this.state = null;

	this.gameTypes = {
		Numbers: 0,
		Picture: 1,
	};
	this.gameType = null;

	this.init = function()
	{
		this.cols = i_x;
		this.rows = i_y;
		this.gameType = i_game;

		this.slides = this.cols * this.rows - 1;
		this.cw = mCanvas.width / this.cols;
		this.ch = mCanvas.height / this.rows;

		this.state = this.states.Game;

		this.empty = {
			x: this.cols - 1,
			y: this.rows - 1,
		};

		this.blocks = [];

		if(this.gameType === this.gameTypes.Numbers)
		{
			var i;
			for(i = 0; i < this.slides; i++) 
			{
				this.blocks.push(new Block(i, i+1, null));
			}
		}
		else if(this.gameType === this.gameTypes.Picture && imageRepository.sheet != null)
		{
			var sprites = imageRepository.getSprites(this.cols, this.rows, this.cw, this.ch);

			var i;
			for(i = 0; i < this.slides; i++) 
			{
				this.blocks.push(new Block(i, i+1, sprites[i]));
			}
		}


		var mixedBlocks = this.blocks.slice();
		mixedBlocks.mix();

		this.map = new Map(this.cols, this.rows, mixedBlocks);
	};
	////////////////////////////////////
	///

	this.start = function()
	{
		this.init();
		loop();
	}

	this.update = function()
	{	
		if(this.state === this.states.Game) this.updateBlocks();
	};

	this.render = function()
	{
		mCanvas.ctx.clearRect(0, 0, mCanvas.width, mCanvas.height);

		if(imageRepository.sheet != null && this.gameType === this.gameTypes.Numbers)
		{
			mCanvas.ctx.drawImage(imageRepository.sheet, 0, 0, mCanvas.width, mCanvas.height);
		}

		this.drawBlocks();

		drawText(this.state);
	};
	////////////////////////////////
	///
	
	this.drawBlocks = function()
	{
		var i;
		for(i = 0; i < this.blocks.length; i++) this.blocks[i].draw();
	};

	this.updateBlocks = function()
	{
		var i;
		for(i = 0; i < this.blocks.length; i++) 
		{
			this.blocks[i].update();
		}

		var cnt = 0, inOrder = 0;
		var x, y;
		for(y = 0; y < this.rows; y++)
		{
			for(x = 0; x < this.cols; x++)
			{
				var item = this.map.get(x, y);

				if(item !== null)
				{
					if(cnt === item.id)
					{
						inOrder ++;
						if(inOrder === this.slides)
						{
							this.state = this.states.End;
							break;
						}
					}
					cnt++;
				}
				else
				{
					return;
				}

			}
		}

	};
}

function Map(cols, rows, blocks)
{
	this.cols = cols;
	this.rows = rows;
	this.grid = [];

	var x, y, cnt = 0;
	for(y = 0; y < rows; y++)
	{
		this.grid.push(new Array());

		for(x = 0; x < cols; x++)
		{
			if(cnt < blocks.length)
			{
				blocks[cnt].init(x, y);
				this.grid[y].push(blocks[cnt]);

				cnt++;
			}
			else
			{
				this.grid[y].push(null);
			}
		}
	};

	this.get = function(x, y)
	{
		return this.grid[y][x];
	};

	this.set = function(x, y, value)
	{
		this.grid[y][x] = value;
	};
}

function Block(id, value, sprite)
{
	this.id = id;
	this.value = value;
	this.sprite = sprite;

	this.hoover = false;

	this.init = function(x, y)
	{
		this.x = x;
		this.y = y;
		this.rx = x*game.cw;
		this.ry = y*game.ch;
	}

	this.update = function()
	{
		if(Mouse.x < this.rx + game.cw && this.rx < Mouse.x && 
			Mouse.y < this.ry + game.ch && this.ry < Mouse.y)
		{
			this.hoover = true;

			if(Mouse.down) 
			{	
				this.presun();
			}
		}
		else this.hoover = false;

		this.rx = this.x * game.cw;
		this.ry = this.y * game.ch;
	}

	this.draw = function()
	{	
		//Numbers
		if(this.sprite === null && game.gameType === game.gameTypes.Numbers)
		{
			if(this.hoover) mCanvas.ctx.fillStyle = "rgba(0,255,100, 0.5)";
			else mCanvas.ctx.fillStyle = "rgba(255,255,255, 0.5)";

			mCanvas.ctx.fillRect(this.rx, this.ry, game.cw, game.ch);

			mCanvas.ctx.font="18px Arial";
			mCanvas.ctx.fillStyle = "black";

			var x = this.rx + (game.cw / 2) - 5;
			var y = this.ry + (game.ch / 2) + 5;
			mCanvas.ctx.fillText(this.value, x, y);
		}
		else //Pictures
		{
			this.sprite.draw(mCanvas.ctx, this.rx, this.ry);

			if(this.hoover)
			{
				mCanvas.ctx.fillStyle = "rgba(0,255,100, 0.5)";
				mCanvas.ctx.fillRect(this.rx, this.ry, game.cw, game.ch);
			}

			mCanvas.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
			mCanvas.ctx.fillRect(this.rx, this.ry, 15, 12);

			mCanvas.ctx.font="10px Arial";
			mCanvas.ctx.fillStyle = "black";

			var x = this.rx + 2;
			var y = this.ry + 9;
			mCanvas.ctx.fillText(this.value, x, y);
		}


		mCanvas.ctx.strokeStyle = "black";
		mCanvas.ctx.strokeRect(this.rx, this.ry, game.cw, game.ch);
	};

	this.presun = function()
	{	
		var ex = game.empty.x;
		var ey = game.empty.y;

		if((this.x - 1 === ex && this.y === ey) || (this.x + 1 === ex && this.y === ey) ||
		   (this.y - 1 === ey && this.x === ex) || (this.y + 1 === ey && this.x === ex))
		{	
			game.map.set(ex, ey, this);
			game.map.set(this.x, this.y, null);

			game.empty.x = this.x;
			game.empty.y = this.y;

			this.x = ex;
			this.y = ey;
		}
	};
}

//Helpers
/////////////////////

function Screen(width, height, id)
{
	this.canvas = document.getElementById(id);
	this.canvas.width = this.width = width;
	this.canvas.height = this.height = height;
	//this.canvas.id = id;

	this.ctx = this.canvas.getContext("2d");
	//document.body.appendChild(this.canvas);
}

function MouseHandler()
{
	this.x = null;
	this.y = null;
	this.down = false;

	var self = this;
	mCanvas.canvas.addEventListener("mousemove", function(e){
		self.x = e.clientX - this.offsetLeft;
		self.y = e.clientY - this.offsetTop;
	});

	mCanvas.canvas.addEventListener("mousedown", function(e){
		self.down = true;

	});

	mCanvas.canvas.addEventListener("mouseup", function(e){
		self.down = false;
	});
}

Array.prototype.mix = function()
{
	var helpArr = this.slice();

	for(i = 0; i < this.length; i++)
	{
		var index = getRandom(0, helpArr.length-1);
		this[i] = helpArr[index];

		helpArr.splice(index, 1);
	}
}

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

function getRandom(min, max)
{
	var r = Math.floor(Math.random() * (max - min + 1) + min);
	return r;
}

//FUNCTION
//////////////////////////

function drawText(state)
{
	switch(state)
	{
		case game.states.End:
		{
			mCanvas.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			mCanvas.ctx.fillRect(0, 0, mCanvas.width, mCanvas.height);

			mCanvas.ctx.font=" bold 40px Arial";
			mCanvas.ctx.fillStyle = 'red';
			mCanvas.ctx.fillText("SOLVED", (mCanvas.width / 2) - 80, (mCanvas.height / 2) + 10);
			break;
		}
	}
}
