function ImageRepository()
{
	this.sheet;
	this.init = function(url)
	{
		this.sheet = new Image();
		this.sheet.onload = function() {
			game.start();
		};
		this.sheet.src = url;
	}
}


ImageRepository.prototype.getSprites = function(cols, rows, cw, ch)
{
	var sw = this.sheet.width / mCanvas.width;
	var sh = this.sheet.height / mCanvas.height;
	

	var sprites = [];

	var x, y;
	for(y = 0; y < rows; y++)
	{
		for(x = 0; x < cols; x++)
		{
			var sprite = new Sprite(this.sheet, x*cw*sw, y*ch*sh, cw*sw, ch*sh, cw, ch);
			sprites.push(sprite);
		}
	}

	return sprites;
}

function Sprite(img, x, y, sw, sh, cw, ch)
{
	this.img = img;
	this.x = x;
	this.y = y;
	this.sw = sw;
	this.sh = sh;
	this.cw = cw;
	this.ch = ch;
}

Sprite.prototype.draw = function(ctx, x, y)
{
	ctx.drawImage(this.img, this.x, this.y, this.sw, this.sh,
	 x, y, this.cw, this.ch);
}