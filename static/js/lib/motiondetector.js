var videoElement  = document.querySelector( 'video' );
var masterStream  = '';
var camerainit    = true;
var pendingSave   = false;
var errorCallback = function ( e ) {
	console.log( 'Reeeejected!', e );
};

// initialize showing of video
navigator.getUserMedia( { video: true, audio: true }, function( localMediaStream ) {
	var video = videoElement;
	video.src = window.URL.createObjectURL( localMediaStream );
	// save stream to be accessed when recrding starts
	masterStream = localMediaStream;
}, errorCallback );


document.addEventListener( 'DOMContentLoaded', function () {
	var v        = videoElement;
	var canvas1  = document.getElementById( 'c1' );
	var canvas2  = document.getElementById( 'c2' );
	var context1 = canvas1.getContext( '2d' );
	var context2 = canvas2.getContext( '2d' );

	var cw1 = canvas1.clientWidth ;
	var ch1 = canvas1.clientHeight ;
	var cw2 = canvas2.clientWidth ;
	var ch2 = canvas2.clientHeight ;

	v.addEventListener( 'play', function () {
		drawit( this, context1, context2, cw1, ch1, cw2, ch2 );
	}, false );
}, false );

function drawit ( v, c1, c2, w1, h1, w2, h2 ) {
	if ( v.paused || v.ended ) return false;

	c1.drawImage( v, 0, 0, w1, h1 ); 

	setTimeout( function () {
	  c2.drawImage( v, 0, 0, w2, h2 );
	}, 1000 );

	setTimeout( function () {  
		var a = document.getElementById('c1');
		var b = document.getElementById('c2');
		
		// compare the two canvas
		resembleControl = resemble( convert( a ) ).compareTo( convert( b ) ).onComplete( function ( data ) {		
			var error = parseInt(data.misMatchPercentage);
			console.log( error );
			if ( error > 24 ) {
				if( !camerainit && !pendingSave  ){
					// play suspense music
					playSound();
					
					// start recroding
					startCulpritRecording();

					// stop recording after time 't'
					var t = 1*( 60 *1000 );					
					setTimeout( function () {
						stopCulpritRecording();
						
					}, t );

					pendingSave = true;          
				} else {
					camerainit = false;
				}
			}
			setTimeout( drawit, 50, v, c1, c2, w1, h1, w2, h2 );
		} );
	}, 2000 );
};

function playSound () {
	var player = document.querySelector( 'audio' );
	
	if ( player.ended ) {
		console.log('it detects it ended');
		player.load();
		player.play();
	} else {
		player.play();
	}
};

// helper function	
function convert ( canvas ) {
	return canvas.toDataURL("image/png");
};