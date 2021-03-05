function SoundManager()
{
	this.explosion = new Audio("sounds/explosion.wav");
	this.explosion.load();

	this.splash = new Audio("sounds/splash.wav");
	this.splash.load();

	this.fire = new Audio("sounds/fire.mp3");
	this.fire.load();
}