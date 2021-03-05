var game, imageManager, soundManager, Mouse;

window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           function( callback ){
           window.setTimeout(callback, 1000 / 60);
          };
})();

var cg = {
	"w": 1200,
	"h": 550,
	"cols": 10,
	"rows": 10,
	"cw": 40,
	"ch": 40,

	"ships": {
		
		"0": {
			"id": 0,
			"name": 'clun',
			"length": 1
		},

		"1": {
			"id": 1,
			"name": 'ponorka',
			"length": 2
		},

		"2": {
			"id": 2,
			"name": 'kriznik',
			"length": 3
		},

		"3": {
			"id": 3,
			"name": 'letadlova',
			"length": 4
		}
	},

	"dires": {
		"Horizontal" : 0,
		"Vertical": 1
	},

	"dock": {
		"x": 540,
		"y": 50
	},

	"map1": {
		"x": 40,
		"y": 50,
		"id": 0
	},

	"map2": {
		"x": 680,
		"y": 50,
		"id": 1
	},

	"map": {
		"Watter": 0,
		"Ship": 1,
		"ShotOnWatter": 2,
		"ShotOnShip": 3
	},

	poradiLodi: new Array(3, 2, 2, 1, 1, 1, 0, 0, 0, 0),

	canvasBgr: "#99DAF0",
	//canvasBgr: "#C4F5E9",

	lineColor: "#003D52",
	mapColor: "white",

	shipColor: "#2F738A",
	shipStroke: "#00394D",

	alfabeta: "abcdefghij"
}

window.onload = function() { 
	imageManager = new ImageManager();
	soundManager = new SoundManager(); 
}

function main()
{
	imageManager.initSprites();

	game = new Game();

	Mouse = new MouseHandler();

	document.getElementById("mCanvas").style.cursor = 'none';

	game.init();
	loop();
}

function loop()
{
	game.update();
	game.draw();

	window.requestAnimFrame(loop);
}

//Classes
///////////////////////////////////////
function Game()
{
	this.states = {
		Menu: 0,
		InitPlayer: 1,
		InitComputer: 2,
		GameFtComputer: 3,
		GameFtPlayer: 4,
		End: 5,
	};
	this.state = null;

	this.gameTypes = {
		VsComputer: 0,
		VsPlayer: 1
	};
	this.gameType = null;

	this.mCanvas = mCanvas = new Screen(cg.w, cg.h, "mCanvas");
	this.ctx = mCanvas.ctx;

	this.init = function()
	{
		this.setState(this.states.Menu);
	};

	this.setState = function(state)
	{
		this.state = state;
		this.initState(state);
	};

	this.initState = function(state)
	{
		if(state === this.states.Menu)
		{
			this.buttons = [];

			var font = "30px Arial";
			var color = "rgba(255, 255, 255, 0.7)";

			this.buttons[0] = new Button("Computer", font, color, b_startGame, [this.gameTypes.VsComputer]);
			this.buttons[0].init(450, 200, 150, 50);

			this.buttons[1] = new Button("Two players", font, color, b_startGame, [this.gameTypes.VsPlayer]);
			this.buttons[1].init(425, 280, 200, 50);
		}
		else if(state === this.states.InitPlayer)
		{
			this.selectedShip = null;
			this.dragAction = false;

			this.buttons = [];

			var font = "20px Arial";
			var color = "white";

			this.buttons[0] = new Button("Auto", font, color, b_setRandomlyShips, null);
			this.buttons[0].init(540, 330, 50, 50);

			this.buttons[1] = new Button("Turn", font, color, b_turnShip, null);
			this.buttons[1].init(620, 330, 50, 50);

			this.buttons[2] = new Button("Play", font, color, b_finishInit, null);
			this.buttons[2].init(565, 400, 80, 50);
		}
		else if(state === this.states.InitComputer)
		{
			this.buttons = [];
		}
	};

	this.update = function()
	{
		this.updateState(this.state);
	};

	this.updateState = function(state)
	{
		if(state === this.states.Menu)
		{
			for(var i = 0; i < this.buttons.length; i++) this.buttons[i].update();
		}

		else if(state === this.states.InitPlayer)
		{
			this.currentPlayer.initUpdate();

			for(var i = 0; i < this.buttons.length; i++) this.buttons[i].update();
		}

		else if(state === this.states.InitComputer)
		{
			this.currentPlayer.initUpdate();
		}

		else if(state === this.states.GameFtPlayer || state === this.states.GameFtComputer)
		{
			this.currentPlayer.shotUpdate();
			if(!(this.currentPlayer instanceof Computer)) this.secondPlayer.map.shotUpdate();
		}

		else if(state === this.states.End)
		{

		}
	};

	this.draw = function()
	{
		this.ctx.clearRect(0, 0, mCanvas.w, mCanvas.h);

		//mCanvas.ctx.fillStyle = "#99DAF0";
		this.ctx.fillStyle = cg.canvasBgr;
		this.ctx.fillRect(0, 0, mCanvas.w, mCanvas.h);

		this.drawState(this.state);

		Mouse.draw(this.ctx);
	};

	this.drawState = function(state)
	{
		if(this.state === this.states.Menu)
		{
			for(var i = 0; i < this.buttons.length; i++) this.buttons[i].draw(this.ctx);
		}

		else if(this.state === this.states.InitPlayer)
		{
			this.currentPlayer.map.draw(this.ctx);
			this.currentPlayer.map.drawCrosshair(this.ctx);

			//draw ships without selected the one
			for(var i = 0; i < this.currentPlayer.ships.length; i++)
			{
				if(this.currentPlayer.ships[i] !== this.selectedShip)
				{
					this.currentPlayer.ships[i].draw(this.ctx);
				}
			}
			//draw the selected - hovering
			if(this.selectedShip !== null) this.selectedShip.draw(this.ctx);

			for(var i = 0; i < this.buttons.length; i++) this.buttons[i].draw(this.ctx);
		}

		else if(this.state === this.states.InitComputer)
		{
			//...
		}

		else if(this.state === this.states.GameFtComputer)
		{
			this.player1.map.draw(this.ctx);
			this.player1.drawShips(this.ctx);

			this.player2.map.draw(this.ctx);

			if(this.currentPlayer === this.player1 && !this.player1.firing)
			{
				this.player2.map.drawCrosshair(this.ctx);
			}

			this.player1.drawDestroyedShips(this.ctx);
			this.player2.drawDestroyedShips(this.ctx);

			this.player1.map.drawShots(this.ctx);
			this.player2.map.drawShots(this.ctx);
		}

		else if(this.state === this.states.GameFtPlayer)
		{
			this.player1.map.draw(this.ctx);

			this.player2.map.draw(this.ctx);

			if(!this.currentPlayer.firing)
			{
				this.secondPlayer.map.drawCrosshair(this.ctx);
			}

			this.player1.drawDestroyedShips(this.ctx);
			this.player2.drawDestroyedShips(this.ctx);

			this.player1.map.drawShots(this.ctx);
			this.player2.map.drawShots(this.ctx);
		}

		else if(this.state === this.states.End)
		{

		}
	};

	///////////////////////////////////////////
	//////////////////////////////////////////
	
	this.startGame = function(gameType)
	{
		this.setState(this.states.InitPlayer);
		this.gameType = gameType;

		this.player1 = new Player(0);
		this.player2;

		if(gameType === this.gameTypes.VsComputer) this.player2 = new Computer(1);
		else this.player2 = new Player(1);

		this.player1.init();
		this.player2.init();

		this.player1.map.init(cg.map1.x, cg.map1.y);
		this.player2.map.init(cg.map2.x, cg.map2.y);

		this.currentPlayer = this.player1
		this.secondPlayer = this.player2;
	};

	this.finishInit = function()
	{
		if(this.currentPlayer.map.shipCollision) return;

		var shipsOnMap = 0;
		for(var i = 0; i < this.currentPlayer.ships.length; i++)
		{
			if(this.currentPlayer.ships[i].onMap) shipsOnMap++;
		}

		if(shipsOnMap === this.currentPlayer.ships.length)
		{
			this.currentPlayer.setShipsIntoMap();
			this.currentPlayer.readyForBattle = true;

			if(this.currentPlayer === this.player1)
			{
				if(!this.currentPlayer instanceof Computer)
				{
					game.currentPlayer.map.collisionShips = [];
				}

				this.currentPlayer = this.player2;
				this.secondPlayer = this.player1;

				if(this.currentPlayer instanceof Computer)
				{
					this.setState(this.states.InitComputer);				
				}
				else
				{
					this.setState(this.states.InitPlayer);
				}
			}
		}

		if(this.player1.readyForBattle && this.player2.readyForBattle)
		{
			if(this.gameType === this.gameTypes.VsComputer)
			{
				this.setState(this.states.GameFtComputer);
			}
			else this.setState(this.states.GameFtPlayer);

			if(getRandom(0, 1) === 1) 
			{
				this.currentPlayer = this.player1;
				this.secondPlayer = this.player2;
			}

			return;
		}
	};
}

function Map(cols, rows, id)
{
	this.cols = cols;
	this.rows = rows;
	this.w = cols*cg.cw;
	this.h = cols*cg.ch;
	this.id = id;

	this.init = function(x, y)
	{
		this.x = x;
		this.y = y;

		this.grid = [];

		var x, y;
		for(y = 0; y < this.rows; y++)
		{
			this.grid.push(new Array());

			for(x = 0; x < this.cols; x++)
			{
				this.grid[y].push(cg.map.Watter);
			}
		}

		this.shipCollision = false;
		this.collisionShips = [];

		this.coordField = {
			x: [],
			y: []
		};
	};


	this.get = function(x, y)
	{
		if(x >= 0 && x < this.cols && y >= 0 && y < this.rows)
		{
			return this.grid[y][x];
		}
		else return null;
	};

	this.set = function(x, y, value)
	{
		this.grid[y][x] = value;
	};


	this.initUpdate = function()
	{
		this.coordField.x = [];
		this.coordField.y = [];

		var selectedShip = game.selectedShip;

		if(!(selectedShip === null) && selectedShip.selected)
		{
			if(selectedShip.x >= this.x && selectedShip.x + selectedShip.w <= this.x + this.w &&
			   selectedShip.y >= this.y && selectedShip.y + selectedShip.h <= this.y + this.h)
			{
				if(selectedShip.dir === cg.dires.Horizontal)
				{
					for(var i = 0; i < selectedShip.type.length; i++)
					{
						this.coordField.x.push(Math.round((selectedShip.x - this.x) / cg.cw) + i);
					}

					this.coordField.y.push(Math.round((selectedShip.y - this.y) / cg.ch));
				}
				else if(selectedShip.dir === cg.dires.Vertical)
				{
					for(var i = 0; i < selectedShip.type.length; i++)
					{
						this.coordField.y.push(Math.round((selectedShip.y - this.y) / cg.ch) + i);
					}

					this.coordField.x.push(Math.round((selectedShip.x - this.x) / cg.cw));
				}

				this.checkCollisionOfShips();
			}
		}
	}

	this.shotUpdate = function()
	{
		this.coordField.x = [];
		this.coordField.y = [];

		if(AABBIntersect(Mouse.x, Mouse.y, 0, 0, this.x, this.y, this.w, this.h))
		{
			this.coordField.x.push(Math.floor((Mouse.x - this.x) / cg.cw));
			this.coordField.y.push(Math.floor((Mouse.y - this.y) / cg.ch));
		}
	}

	this.draw = function(ctx)
	{
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.fill();

		ctx.lineWidth = "1";
		ctx.strokeStyle = cg.lineColor;

		ctx.font = "20px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "black";

		//Draw lines
		var x, y;

			//y lines
		var xOffset;
		if(this.id === cg.map1.id) xOffset = this.x - cg.cw / 2;
		else xOffset = this.x + this.w + cg.cw / 2;

		for(y = 1; y <= this.rows; y++)
		{
			//line
			if(y < this.rows)
			{
				ctx.beginPath();
				ctx.moveTo(this.x, y*cg.ch + this.y);
				ctx.lineTo(this.w + this.x, y*cg.ch + this.y);
				ctx.stroke();
			}

			//letter
			ctx.fillText(cg.alfabeta[y-1], xOffset, this.y + cg.ch * y - cg.ch / 2);
		}

		//x lines
		for(x = 1; x <= this.cols; x++)
		{
			//line
			if(x < this.cols)
			{
				ctx.beginPath();
				ctx.moveTo(x*cg.cw+this.x, this.y);
				ctx.lineTo(x*cg.cw+this.x, this.h+this.y);
				ctx.stroke();
			}

			//letter
			ctx.fillText(x, this.x + cg.cw * x - cg.cw / 2, this.y - cg.ch/2);
		}

		ctx.lineWidth = "3";
		ctx.strokeRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
	}

	this.drawCrosshair = function(ctx)
	{
		
		ctx.fillStyle = "rgba(20, 255, 0, 0.5)";

		if(game.selectedShip !== null && game.selectedShip.selected)
		{
			if(this.collisionShips.contains(game.selectedShip))
			{
				ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
			}
		}

			//draw colums
			for(var i = 0; i < this.coordField.x.length; i++)
			{
				var tx = this.coordField.x[i] * cg.cw;

				for(var y = 0; y < this.rows; y++)
				{
					ctx.fillRect(tx + this.x + 1, y*cg.ch + this.y + 1, cg.cw - 2, cg.ch - 2);
				}
			}

			//draw rows
			for(var i = 0; i < this.coordField.y.length; i++)
			{
				var ty = this.coordField.y[i] * cg.ch;

				for(var x = 0; x < this.cols; x++)
				{
					ctx.fillRect(x*cg.cw + this.x + 1, ty + this.y + 1, cg.cw - 2, cg.ch - 2);
				}
			}


		};

	this.drawShots = function(ctx)
	{
		for(var y = 0; y < this.rows; y++)
		{
			for(var x = 0; x < this.cols; x++)
			{
				var xy = this.get(x, y);

				if(xy === cg.map.ShotOnWatter)
				{
					imageManager.s_blop.draw(this.x + x*cg.cw, this.y + y*cg.ch, ctx);
				}
				else if(xy === cg.map.ShotOnShip)
				{
					imageManager.s_fire.draw(this.x + x*cg.cw, this.y + y*cg.ch, ctx);
				}
			}
		}
	}

	this.checkCollisionOfShips = function()
	{
		this.shipCollision = false;
		this.collisionShips = [];

		var collision = false;

		for(var i = 0; i < game.currentPlayer.ships.length; i++)
		{
			var lodA = game.currentPlayer.ships[i];

			for(var j = 0; j < game.currentPlayer.ships.length; j++)
			{
				var lodB = game.currentPlayer.ships[j];

				if(this.collisionShips.contains(lodA) && this.collisionShips.contains(lodB)) break;

				if(lodA !== lodB && lodB.onMap && (lodA.onMap || game.selectedShip === lodA))
				{

					collision = AABBIntersect(lodA.mx - 1, lodA.my - 1, lodA.mw + 2,
					lodA.mh + 2, lodB.mx, lodB.my, lodB.mw, lodB.mh);
					
					if(collision)
					{
						if(!this.collisionShips.contains(lodA)) this.collisionShips.push(lodA);
						if(!this.collisionShips.contains(lodB)) this.collisionShips.push(lodB);
					}
				}
			}
		}

		this.shipCollision = this.collisionShips.length > 0;

	};
}

function Player(id)
{
	this.id = id;
	this.map = new Map(cg.cols, cg.rows, id);
	this.ships = [];

	for(var i = 0; i < cg.poradiLodi.length; i++)
	{
			var id = cg.poradiLodi[i];
			this.ships.push(new Ship(cg.ships[id], this));
	}

	this.init = function()
	{
		var i;
		for(i = 0; i < this.ships.length; i++) 
		{
			this.ships[i].init(cg.dock.x, cg.dock.y, cg.dires.Horizontal, false);
		}

		this.readyForBattle = false;
		this.destroyedShips = [];
		this.firing = false;
	};

	this.initUpdate = function()
	{
		if(game.selectedShip !== null)
		{
			game.selectedShip.update();
		}
		if(!game.dragAction)
		{
			var i;
			for(i = 0; i < this.ships.length; i++) this.ships[i].update();
		}

		this.map.initUpdate();
	};

	this.shotUpdate = function()
	{
		if(this.firing) return;

		var enemyMap = game.secondPlayer.map;

		var mx = enemyMap.coordField.x[0];
		var my = enemyMap.coordField.y[0];

		if(mx !== undefined && my !== undefined && Mouse.clicked())
		{
			if(enemyMap.get(mx, my) !== cg.map.ShotOnShip &&
			   enemyMap.get(mx, my) !== cg.map.ShotOnWatter)
			{
				this.fire(mx, my, enemyMap);
			}
		}
	};

	this.fire = function(mx, my, map)
	{
		this.firing = true;
		var self = this;

		var sound = new Audio("sounds/fire.mp3");
		sound.play()

		window.setTimeout(function(){
			self.shot(mx, my, map);
		}, 1000);
	};

	this.drawShips = function(ctx)
	{
		var i;
		for(i = 0; i < this.ships.length; i++) this.ships[i].draw(ctx);
	};

	this.drawDestroyedShips = function(ctx)
	{
		var i;
		for(i = 0; i < this.destroyedShips.length; i++)
		{
			this.destroyedShips[i].draw(ctx);
		}
	};

	////////////////////////////////////////
	////////////////////////////////////////
	
	this.setRandomlyShips = function()
	{
		var setAreas = [];
		for(var i = 0; i < this.ships.length; i++)
		{
			var lod = this.ships[i];

			var volneSouradniceH = [];
			var volneSouradniceV = [];
			for(var x = 0; x < this.map.cols; x++)
			{
				for(var y = 0; y < this.map.rows; y++)
				{
					var souradnice = {x:x, y:y};
					var kolizeV = false;
					var kolizeH = false;

					for(var j = 0; j < setAreas.length; j++)
					{
						var oblast = setAreas[j];
						if(AABBIntersect(x, y, lod.type.length, 1, oblast.x, oblast.y, oblast.w, oblast.h)) kolizeH = true;
						if(AABBIntersect(x, y, 1, lod.type.length, oblast.x, oblast.y, oblast.w, oblast.h)) kolizeV = true;

					}

					if(x <= this.map.cols - lod.type.length && !kolizeH) volneSouradniceH.push(souradnice);
					if(y <= this.map.rows - lod.type.length && !kolizeV) volneSouradniceV.push(souradnice);
				}
			}

			var dir, rIndex, souradnice;
			if((volneSouradniceV.length > 0 && getRandom(0, 1) === 1) || (volneSouradniceV.length > 0 && volneSouradniceH == 0))
			{
				dir = cg.dires.Vertical;
				rIndex = getRandom(0, volneSouradniceV.length - 1);
				souradnice = volneSouradniceV[rIndex];
			}
			else
			{
				dir = cg.dires.Horizontal;
				rIndex = getRandom(0, volneSouradniceH.length - 1);
				souradnice = volneSouradniceH[rIndex];
			}

			lod.init(souradnice.x*cg.cw + this.map.x, souradnice.y*cg.ch + this.map.y, dir, true);

			setAreas.push({
				x: lod.mx - 1, //souradnice.x
				y: lod.my - 1, //souradnice.y
				w: lod.mw + 2,
				h: lod.mh + 2
			});
		}
	};

	this.setShipsIntoMap = function()
	{
		for(var i = 0; i < this.ships.length; i++)
		{
			this.ships[i].setIntoMap(this.map);
		}
	};

	this.getShipAt = function(mx, my)
	{
		var ship;

		for(var i = 0; i < this.ships.length; i++)
		{
			ship = this.ships[i];
			if(mx >= ship.mx && mx <= ship.mx + ship.mw - 1 &&
			   my >= ship.my && my <= ship.my + ship.mh - 1)
			{
				return ship;
			}
		}

		return null;
	};
}

Player.prototype.shot = function(mx, my, map)
{
	var hit = false;
	var self = this;
	
		if(map.get(mx, my) === cg.map.Ship) hit = true;

		if(hit)
		{
			map.set(mx, my, cg.map.ShotOnShip);

			var hitedShip = game.secondPlayer.getShipAt(mx, my);
			hitedShip.takeDamage();

			var sound = new Audio("sounds/explosion.wav");
			sound.play();

			window.setTimeout(function(){
				self.firing = false;
			}, 1000);
		}
		else
		{
			map.set(mx, my, cg.map.ShotOnWatter);

			var sound = new Audio("sounds/splash.wav");
			sound.play();

			window.setTimeout(function(){
				self.firing = false;
				game.currentPlayer = game.secondPlayer;
				game.secondPlayer = self;
			}, 1000);
			
		}
}
function Computer(id)
{
	this.id = id;
	this.map = new Map(cg.cols, cg.rows, id);
	this.ships = [];

	this.hitedShip = {
		ship: null,
		shots: [],
		dir: null
	};

	for(var i = 0; i < cg.poradiLodi.length; i++)
	{
			var id = cg.poradiLodi[i];
			this.ships.push(new Ship(cg.ships[id], this));
	}

	this.initUpdate = function()
	{
		this.setRandomlyShips();
		game.finishInit();
	};

	this.shotUpdate = function()
	{
		//if(Mouse.down) return;
		if(this.firing) return;
		
		var enemyMap = game.secondPlayer.map;
		var possibleShots = [];

		if(this.hitedShip.ship !== null)
		{
			//select shotCoord arround hited ship
			
			var nshots = [];

			if(this.hitedShip.dir === null)
			{
				//dir is unknown
				var shot = this.hitedShip.shots[0];

				nshots.push({mx: shot.mx - 1, my: shot.my});
				nshots.push({mx: shot.mx + 1, my: shot.my});
				nshots.push({mx: shot.mx, my: shot.my - 1});
				nshots.push({mx: shot.mx, my: shot.my + 1});
				
			}
			else if (this.hitedShip.dir === cg.dires.Horizontal)
			{
				//dir is horizontal
				var highestShot = this.getHighestShot();
				var lowestShot = this.getLowestShot();

				nshots.push({mx: highestShot.mx + 1, my: highestShot.my});
				nshots.push({mx: lowestShot.mx - 1, my: lowestShot.my});
			}
			else if(this.hitedShip.dir === cg.dires.Vertical)
			{
				//dir is vertical
				var highestShot = this.getHighestShot();
				var lowestShot = this.getLowestShot();

				nshots.push({mx: highestShot.mx, my: highestShot.my + 1});
				nshots.push({mx: lowestShot.mx, my: lowestShot.my - 1});
			}


			for(var i = 0; i < nshots.length; i++)
			{
				var nshot = nshots[i];
				var hit = enemyMap.get(nshot.mx, nshot.my);

				if(hit === cg.map.Watter || hit === cg.map.Ship) //uprav
				{
					possibleShots.push(nshot);
				}
			}
		}
		else
		{
			//select shotCoord randomly from all map
			
			for(var i = 0; i < enemyMap.rows; i++)
			{
				for(var j = 0; j < enemyMap.cols; j++)
				{
					var coord = { mx: j, my: i};
					if(enemyMap.get(coord.mx, coord.my) !== cg.map.ShotOnShip &&
						enemyMap.get(coord.mx, coord.my) !== cg.map.ShotOnWatter)
					{
						possibleShots.push(coord);
					}
				}
			}
		}

		var randomIndex = getRandom(0, possibleShots.length -1);
		var shotCoord = possibleShots[randomIndex];

		this.fire(shotCoord.mx, shotCoord.my, enemyMap);
	};

	//get highest coord of shots at enemy ship
	this.getHighestShot = function()
	{
		var highestShot = this.hitedShip.shots[0];

		for(var i = 1; i < this.hitedShip.shots.length; i++)
		{
			var shot = this.hitedShip.shots[i]

			if(shot.mx > highestShot.mx || shot.my > highestShot.my) highestShot = shot;
		}
		
		return highestShot;
	};

	//get lowest coord of shots at enemy ship
	this.getLowestShot = function()
	{
		var lowestShot = this.hitedShip.shots[0];

		for(var i = 1; i < this.hitedShip.shots.length; i++)
		{
			var shot = this.hitedShip.shots[i]

			if(shot.mx < lowestShot.mx || shot.my < lowestShot.my) lowestShot = shot;
		}
		
		return lowestShot;
	};
}
Computer.prototype = new Player();
Computer.prototype.constructor = Player;

Computer.prototype.shot = function(mx, my, map)
{
	Player.prototype.shot.call(this, mx, my, map);

	//if was hited some ship
	if(map.get(mx, my) === cg.map.ShotOnShip)
	{
		if(this.hitedShip.ship === null)
		{
			var hitedShip = game.secondPlayer.getShipAt(mx, my);
			this.hitedShip.ship = hitedShip;
		}

		if(this.hitedShip.ship.alive)
		{
			this.hitedShip.shots.push({mx:mx, my:my});

			if(this.hitedShip.shots.length === 2)
			{
				this.hitedShip.dir = this.hitedShip.ship.dir;
			}
		}
		else // ship is destroyed
		{
			this.hitedShip.ship = null;
			this.hitedShip.shots = [];
			this.hitedShip.dir = null;
		}
	}
}

function Ship(type, owner)
{
	this.type = type;
	this.owner = owner;

	this.x;	 //real x
	this.y;  //real y
	this.mx; //map x
	this.my; //map y

	this.w;  //real w
	this.h;  //real h
	this.mw; //map w
	this.mh; //map h

	this.dir;
	this.alive;

	this.init = function(x, y, dir, onMap)
	{
		this.setPosition(x, y);

		this.setDir(dir);

		this.alive = true;
		this.selected = false;
		this.onMap = onMap;
		this.lives = this.type.length;
	};


	this.setDir = function(dir)
	{
		this.dir = dir;

		if(dir === cg.dires.Horizontal)
		{
			this.mw = this.type.length;
			this.mh = 1;
		}
		else if(dir === cg.dires.Vertical)
		{
			this.mw = 1;
			this.mh = this.type.length;
		}

		this.w = this.mw * cg.cw;
		this.h = this.mh * cg.ch;
	};

	this.setPosition = function(x, y)
	{
		this.x = x;
		this.y = y;

		this.mx = Math.round((x - this.owner.map.x) / cg.cw);
		this.my = Math.round((y - this.owner.map.y) / cg.ch);
	};

	this.offsetX = 0;
	this.offsetY = 0;
	this.update = function()
	{	
		//Drag
		if(AABBIntersect(Mouse.x, Mouse.y, 0, 0, this.x, this.y, this.w, this.h) &&
		   Mouse.down && !game.dragAction)
		{

				this.offsetX = Mouse.x - this.x;
				this.offsetY = Mouse.y - this.y;

				game.selectedShip = this;
				game.dragAction = true;

				this.selected = true;
				this.onMap = false;
		}
		if(Mouse.down === false && this.selected)
		{
				this.selected = false;
				game.dragAction = false;

				this.setOnMap(this.owner.map);
		}

		if(this.selected) this.drag(this.offsetX, this.offsetY);


	};

	this.draw = function(ctx)
	{
		ctx.fillStyle = cg.shipColor;
		ctx.fillRect(this.x, this.y, this.w, this.h);

		if(this.owner.map.collisionShips.contains(this))
		{
			ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
			ctx.fillRect(this.x, this.y, this.w, this.h);
		}

		if(game.selectedShip === this)
		{
			ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
			ctx.fillRect(this.x, this.y, this.w, this.h);
		}

		ctx.strokeStyle = cg.shipStroke;
		ctx.lineWidth = "1";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
	};

	this.drag = function(offsetX, offsetY)
	{
		this.setPosition(Mouse.x - offsetX, Mouse.y - offsetY);
	};

	this.setOnMap = function(map)
	{
		if(this.x >= map.x && this.x + this.w <= map.x + map.w &&
		   this.y >= map.y && this.y + this.h <= map.y + map.h)
		{
			var nx = Math.round((this.x - map.x) / cg.cw) * cg.cw + map.x;
			var ny = Math.round((this.y - map.y) / cg.ch) * cg.ch + map.y;

			this.setPosition(nx , ny);

			this.onMap = true;
		}
		else
		{
			this.init(cg.dock.x, cg.dock.y, cg.dires.Horizontal, false);
			game.selectedShip = null;
		}
	};

	this.setIntoMap = function(map)
	{
		if(!this.onMap) return;

		if(this.dir === cg.dires.Horizontal)
		{
			for(var i = 0; i < this.type.length; i++)
			{
				map.set(this.mx + i, this.my, cg.map.Ship);
			}
		}
		else if(this.dir === cg.dires.Vertical)
		{
			for(var i = 0; i < this.type.length; i++)
			{
				map.set(this.mx, this.my + i, cg.map.Ship);
			}
		}
	};

	this.turn = function() 
	{
		if(this.onMap)
		{
			if(this.dir === cg.dires.Horizontal) 
			{
				this.setDir(cg.dires.Vertical);

				if(this.my + this.mh > this.owner.map.rows) 
					this.setPosition(this.x, this.y - (this.h - cg.ch));
			}
			else if (this.dir === cg.dires.Vertical)
			{
				this.setDir(cg.dires.Horizontal);

				if(this.mx + this.mw > this.owner.map.cols) 
					this.setPosition(this.x - (this.w - cg.cw), this.y);
			}
		}
	};

	this.takeDamage = function()
	{
		this.lives --;
		if(this.lives === 0)
		{
			this.alive = false;
			this.destroy();
		}
	};

	this.destroy = function()
	{
		var cx = this.mx - 1;
		var cy = this.my - 1;
	
		for(var i = 0; i < (this.type.length - 1) * 2 + 8; i++)
		{

			if(this.owner.map.get(cx, cy) === cg.map.Watter)
			{
				this.owner.map.set(cx, cy, cg.map.ShotOnWatter);
			}

			//jump to next row
			if(cx === this.mx + this.mw)
			{
				cx = this.mx - 1;
				cy++;
			}
			else
			{
				cx++;
			}

			//across ship body
			if(cy > this.my - 1 && cy < this.my + this.mh)
			{
				if(cx === this.mx) cx = this.mx + this.mw;
			}
		}

		this.owner.destroyedShips.push(this);
	};
}