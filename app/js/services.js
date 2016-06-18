angular.module('DrivePi.music', [])

/**
 * Service providing playback and mpd queue functionality
 */
.factory('mpdServices', function($http, $log, $rootScope, $q) {

	function getPlaying() {
		var currentSong = mpdClient.getCurrentSong();

		if (currentSong) {
			var songArtist = currentSong.getArtist();
			// var albumArt = findAlbumArt(songArtist, 'feature');
			var trackMetadata = currentSong.getMetadata()
			var songObj = {
	            'id' :  currentSong.getId(),
	            'name' :  currentSong.getDisplayName(),
	            'playTime' : {
	            				'raw': mpdClient.getCurrentSongTime()
	            			},
	            'duration' : {
	            				'raw': currentSong.getDuration()
	            			},
	            'artist' : songArtist,
	            'album' : currentSong.getAlbum(),
	            'year' : trackMetadata.date,
				'next' : false,
				'paused' : 0
	        }

	        var nextSong = mpdClient.getNextSong();

	        if (nextSong) {

	        	// var albumArt = findAlbumArt(nextSong.getArtist());
				    //     var nextSongObj = {
		        //     'id' :  nextSong.getId(),
		        //     'name' :  nextSong.getDisplayName(),
		        //     'duration' : nextSong.getDuration(),
		        //     'artist' : nextSong.getArtist(),
		        //     'album' : nextSong.getAlbum(),
		        //     'queueid' : nextSong.getQueuePosition(),
		        //     'image' : albumArt
		        // }

		        // songObj.next = nextSongObj;
	        }
	        return songObj;
		}

	}

	return {

    getPlaying: function() {
    	return getPlaying();
    },

	}

});
