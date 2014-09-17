var videoElement   = document.querySelector( 'video' );			
var currentBrowser = !!navigator.mozGetUserMedia ? 'gecko' : 'chromium';

var fileName;
var audioRecorder;
var videoRecorder;

// Firefox can record both audio/video in single webm container
// Don't need to create multiple instances of the RecordRTC for Firefox
// You can even use below property to force recording only audio blob on chrome
// var isRecordOnlyAudio = true;
var isRecordOnlyAudio = !!navigator.mozGetUserMedia;

/********************************* function helpers ******************************************/

// this function submits both audio/video or single recorded blob to nodejs server
function postFiles ( audio, video ) {
	// getting unique identifier for the file name
	fileName = generateRandomString();
	console.log(fileName);

	// this object is used to allow submitting multiple recorded blobs
	var files = { };

	// recorded audio blob
	files.audio = {
		name: fileName + '.' + audio.blob.type.split( '/' )[ 1 ],
		type: audio.blob.type,
		contents: audio.dataURL
	};

	if ( video ) {
		files.video = {
			name: fileName + '.' + video.blob.type.split( '/' )[ 1 ],
			type: video.blob.type,
			contents: video.dataURL
		};
	}

	files.pic = {
		name : generateRandomString(),
		data : convert( document.getElementById('capturedimg') )
	} 

	files.uploadOnlyAudio = !video;

	xhr( '/upload', JSON.stringify( files ), function( _fileName ) {
		console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzz');
		console.log( _fileName );
	} );

	//if ( masterStream ) masterStream.stop();
}

// XHR2/FormData
function xhr ( url, data, callback ) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if ( request.readyState == 4 ) {
			callback( request.responseText );
		}
	};
			
	request.open( 'POST', url, true );
	request.send( data );

	// i promise im gonna change this to promises >.<
    console.log(pendingSave);
    pendingSave = false;

}

// generating random string
function generateRandomString () {
	//return ( Math.random() * new Date().getTime() ).toString( 36 ).replace( /\./g , '' );
	var a = new Date().toUTCString();
	// will REFACTOR this soon
	a = a.split( ',' ).join( '' );
	a = a.split( ':' ).join( '' );
	a = a.split( ' ' ).join( '' ); 
	return a;
}

/************************ end of function helpers ******************************************/

/********************************* main functions ******************************************/			

function onStopRecording () {
	audioRecorder.getDataURL( function ( audioDataURL ) {
		var audio = {
			blob    : audioRecorder.getBlob(),
			dataURL : audioDataURL
		};
		
		// I can see callback hell coming...
		videoRecorder.getDataURL( function ( videoDataURL ) {
			var video = {
				blob    : videoRecorder.getBlob(),
				dataURL : videoDataURL
			};
			
			postFiles(audio, video);
		});
		
	});
}

function startCulpritRecording () {
	var audioConfig = {};
	var videoConfig = { type: 'video' };

	audioConfig.onAudioProcessStarted = function() {
		// invoke video recorder in this callback
		// to get maximum sync
		console.log('SSYYYYYYYYYYYYYYYYYYYNC PLS');
		videoRecorder.startRecording();
	};
	
	audioRecorder = RecordRTC( masterStream, audioConfig );
	videoRecorder = RecordRTC( masterStream, videoConfig );	
	
	audioRecorder.startRecording();
}

function stopCulpritRecording () {
	// callback hell T_T
	audioRecorder.stopRecording( function () {
		videoRecorder.stopRecording( function () {
			onStopRecording();
		} );
	} );
}


