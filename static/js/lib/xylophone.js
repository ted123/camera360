
//var video = document.querySelector( 'video' );

function hasGetUserMedia() {
	// Note: Opera builds are unprefixed.
	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var webcamError = function(e) {
	alert('Webcam error!', e);
};

if (navigator.getUserMedia) {
	navigator.getUserMedia({audio: true, video: true}, function(stream) {
		console.log(stream);
		videoElement.src = window.URL.createObjectURL(stream);
		masterStream = stream;
	}, webcamError);
} else if (navigator.webkitGetUserMedia) {
	navigator.webkitGetUserMedia({audio:true, video:true}, function(stream) {
		video.src = window.webkitURL.createObjectURL(stream);
	}, webcamError);
} else {
	//video.src = 'somevideo.webm'; // fallback.
}

videoElement.addEventListener( 'play', function () {
	setTimeout( function () {
		start();
	}, 3000 );	
}, false );

var timeOut, lastImageData;
var canvasSource = $("#c1")[0];
var canvasBlended = $("#c2")[0];

var contextSource = canvasSource.getContext('2d');
var contextBlended = canvasBlended.getContext('2d');

// mirror video
contextSource.translate(canvasSource.width, 0);
contextSource.scale(-1, 1);

var c = 5;

function start() {
	update();
}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

function update() {
	if( !pendingSave) {
		drawVideo();
		blend();
		
		setTimeout( function () {
			checkAreas();
		}, 100 );
			
	}
	requestAnimFrame(update);
	
	
//		timeOut = setTimeout(update, 1000/60);
}

function drawVideo() {
	var c = canvasSource;
	contextSource.drawImage(videoElement, 0, 0, c.clientWidth, c.clientHeight);
}

function blend() {
	var width = canvasSource.width;
	var height = canvasSource.height;
	// get webcam image data
	var sourceData = contextSource.getImageData(0, 0, width, height);
	// create an image if the previous image doesn’t exist
	if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height);
	// create a ImageData instance to receive the blended result
	var blendedData = contextSource.createImageData(width, height);
	// blend the 2 images
	differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
	// draw the result in a canvas
	contextBlended.putImageData(blendedData, 0, 0);
	// store the current webcam image
	lastImageData = sourceData;
}

function fastAbs(value) {
	// funky bitwise, equal Math.abs
	return (value ^ (value >> 31)) - (value >> 31);
}

function threshold(value) {
	return (value > 0x15) ? 0xFF : 0;
}

function difference(target, data1, data2) {
	// blend mode difference
	if (data1.length != data2.length) return null;
	var i = 0;
	while (i < (data1.length * 0.25)) {
		target[4*i] = data1[4*i] == 0 ? 0 : fastAbs(data1[4*i] - data2[4*i]);
		target[4*i+1] = data1[4*i+1] == 0 ? 0 : fastAbs(data1[4*i+1] - data2[4*i+1]);
		target[4*i+2] = data1[4*i+2] == 0 ? 0 : fastAbs(data1[4*i+2] - data2[4*i+2]);
		target[4*i+3] = 0xFF;
		++i;
	}
}

function differenceAccuracy(target, data1, data2) {
	if (data1.length != data2.length) return null;
	var i = 0;
	while (i < (data1.length * 0.25)) {
		var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
		var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
		var diff = threshold(fastAbs(average1 - average2));
		target[4*i] = diff;
		target[4*i+1] = diff;
		target[4*i+2] = diff;
		target[4*i+3] = 0xFF;
		++i;
	}
}

function checkAreas() {
	var c = canvasSource;
	// loop over the note areas
	for (var r=0; r<8; ++r) {
		var blendedData = contextBlended.getImageData(1/8*r*c.clientWidth, 0, c.clientWidth/8, 100);
		var i = 0;
		var average = 0;

		// important init
		var a = convert( document.getElementById('c1') );
		var b = convert( document.getElementById('c2') );
		var firstPic = a + 'dedito' +c.clientWidth + 'dedito' + c.clientHeight;
		var secondPic = b + 'dedito' +c.clientWidth + 'dedito' + c.clientHeight;

		// loop over the pixels
		while (i < (blendedData.data.length * 0.25)) {
			// make an average between the color channel
			average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
			++i;
		}
		// calculate an average between of the color values of the note area
		average = Math.round(average / (blendedData.data.length * 0.25));
		if (average > 20) {
			if(  !pendingSave  ){
				pendingSave = true;  
				// save compared images
				saveImages( firstPic, secondPic, average);

				// play suspense music
				playSound();
				
				// start recroding
				startCulpritRecording();

				// stop recording after time 't'
				var t = 1*( 60 *1000 );					
				setTimeout( function () {
					stopCulpritRecording();
					
				}, t );

				        
			} 
		}
	}
}


