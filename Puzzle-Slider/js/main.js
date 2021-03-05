var max = 10;
var min = 3;

var i_sheetUrl = "res/background.jpg";
var i_x = 3;
var i_y = 3;
var i_game = 0;


window.onload = function()
{
	main();

	var inputImage = document.getElementById("inputPicture");
	var inputX = document.getElementById("inputX");
	var inputY = document.getElementById("inputY");
	var selectGame = document.getElementById("selectGame");
	var btnPlay = document.getElementById("btnPlay");

	
	inputX.value = i_x;
	inputY.value = i_y;
	selectGame.value = i_game;

	btnPlay.onclick = function()
	{	
			if(inputImage.files[0] != null)
			{
				i_sheetUrl = URL.createObjectURL(inputImage.files[0]);
			}
			
			i_x = parseInt(inputX.value);
			i_y = parseInt(inputY.value);
			i_game = parseInt(selectGame.value);
			
			if(!(i_x > max || i_x < min)) 
			{
					window.cancelAnimationFrame(requestId);
					requestId = undefined;
					imageRepository.init(i_sheetUrl);
			}
	};
};