function ImageManager()
{
	var self = this;
	this.numImages = 3;
	this.loadedImages = 0;

	this.fire = new Image();
	this.blop = new Image();
	this.cursor = new Image();

	this.fire.onload = function() { self.loadImage() };
	this.blop.onload = function() { self.loadImage() };
	this.cursor.onload = function() { self.loadImage() };

	this.fire.src = "res/fire.png";
	this.blop.src = "res/blop.png";
	this.cursor.src = "res/cursor.png";
}

ImageManager.prototype.loadImage = function()
{
	this.loadedImages ++;
	if(this.loadedImages === this.numImages)
	{
		main();
	}
}

ImageManager.prototype.initSprites = function()
{
	this.s_fire = new Sprite(this.fire, cg.cw, cg.ch);
	this.s_blop = new Sprite(this.blop, cg.cw, cg.ch);
	this.s_cursor = new Sprite(this.cursor, cg.cw, cg.ch);
}


function Sprite(img, w, h)
{
	this.img = img;
	this.w = w;
	this.h = h;
}

Sprite.prototype.draw = function(x, y, ctx)
{
	ctx.drawImage(this.img, x, y, this.w, this.h);
}
