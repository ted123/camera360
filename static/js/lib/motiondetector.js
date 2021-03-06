var videoElement  = document.querySelector( 'video' );
var masterStream  = '';
var masterNum     = 0;
var viewNum       = 0;
var camerainit    = true;
var pendingSave   = false;
var errorCallback = function ( e ) {
	console.log( 'Reeeejected!', e );
};

// // initialize showing of video
// navigator.getUserMedia( { video: true, audio: true }, function( localMediaStream ) {
// 	var video = videoElement;
// 	video.src = window.URL.createObjectURL( localMediaStream );
// 	// save stream to be accessed when recrding starts
// 	masterStream = localMediaStream;
// }, errorCallback );


// document.addEventListener( 'DOMContentLoaded', function () {
// 	var v        = videoElement;
// 	var canvas1  = document.getElementById( 'c1' );
// 	var canvas2  = document.getElementById( 'c2' );
// 	var context1 = canvas1.getContext( '2d' );
// 	var context2 = canvas2.getContext( '2d' );

// 	var cw1 = canvas1.clientWidth ;
// 	var ch1 = canvas1.clientHeight ;
// 	var cw2 = canvas2.clientWidth ;
// 	var ch2 = canvas2.clientHeight ;

// 	// clear local storage
// 	localStorage.clear()

// 	v.addEventListener( 'play', function () {
// 		setTimeout( function () {
// 			drawit( v, context1, context2, cw1, ch1, cw2, ch2 );
// 		}, 3000 );	
// 	}, false );
// }, false );

// clear local storage
localStorage.clear()

function drawit ( v, c1, c2, w1, h1, w2, h2 ) {
	if ( v.paused || v.ended ) return false;

	c1.drawImage( v, 0, 0, w1, h1 ); 

	setTimeout( function () {
	  c2.drawImage( v, 0, 0, w2, h2 );
	}, 600 );

	setTimeout( function () {  
		var a = convert( document.getElementById('c1') );
		var b = convert( document.getElementById('c2') );
		var firstPic = a + 'dedito' +w1 + 'dedito' + h1;
		var secondPic = b + 'dedito' +w2 + 'dedito' + h2;
		
		// compare the two canvas
		resembleControl = resemble( a ).compareTo( b ).ignoreColors().onComplete( function ( data ) {		
			var error = parseInt(data.misMatchPercentage);
			//console.log( error );
			if ( error > 24 ) {
				if( !camerainit && !pendingSave  ){
					// save compared images
					saveImages( firstPic, secondPic, error );

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
	}, 610 );
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

function saveImages ( a, b, c ) {

	try {
        localStorage.setItem( 'a'+masterNum, a);
        localStorage.setItem( 'b'+masterNum, b);
        localStorage.setItem( 'c'+masterNum, c);
        masterNum++;
    }
    catch (e) {
        console.log("Storage failed: " + e);
    }

    // view immediately
    viewImages( masterNum-1 );	
};

function viewImages ( mNum ) {

	viewNum = mNum || viewNum;
	
	var canvas1 = document.getElementById( 'capturedimg' );
	var cc      = canvas1.getContext( '2d' );

	try {
       var a = localStorage.getItem( 'a'+viewNum ).split( 'dedito' );
       var b = localStorage.getItem( 'b'+viewNum ).split( 'dedito' );
       var c = localStorage.getItem( 'c'+viewNum );
        viewNum = viewNum+1;
    }
    catch (e) {
        console.log("Storage failed: " + e);
    }

    var img1 = new Image;
    var img2 = new Image;
	img1.src = a[0];
	img2.src = b[0];
	cc.drawImage( img1, 0, 0, 300, 225 );
	cc.drawImage( img2, 300, 0, 300, 225);

	var genError       = document.getElementById("genError");
	var vNum           = document.getElementById("vNum");
	genError.innerHTML =  c+'';
	vNum.innerHTML     =  (viewNum-1)+'';

}

function navigateImages ( direction ) {
	if ( direction === 'prev' && viewNum-1 > 0 ) {
		viewNum = viewNum - 2;
	
	} else if ( direction === 'next' && viewNum < masterNum ) {
		
	} else {
		alert( ' you have reached the end/beginning' );
		return;
	}

	viewImages();
}

function resetViewNum () {
	viewNum = 0;
}

// helper function	
function convert ( canvas ) {
	return canvas.toDataURL("image/png");
};