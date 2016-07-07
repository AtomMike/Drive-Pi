var dataStore = [];

angular.module('DrivePi.music', [])

.factory('Storage', ['$rootScope', function ($rootScope) {

  // Local storage:
    return {

      save: function () {
        window.localStorage['localStorage'] = JSON.stringify(dataStore);
      },
      restore: function() {
				if (window.localStorage['localStorage']) {
        	var storedData = JSON.parse(window.localStorage['localStorage']);
	        return storedData;
				}
      }

    };
  }]
)

.factory('MPDServices', function($q, $timeout, $http, $log, $rootScope, $q) {

	// Get the currently playing song's details:
	function getPlaying() {

		var currentSong = mpdClient.getCurrentSong();
    var nextSong = mpdClient.getNextSong();

		if (currentSong) {
			var artistInfo = currentSong.getArtist();
			var trackMetadata = currentSong.getMetadata()
			var songObject = {
        'id' :  currentSong.getId(),
        'name' :  currentSong.getDisplayName(),
        'playTime' : mpdClient.getCurrentSongTime(),
        'duration' : currentSong.getDuration(),
        'artist' : artistInfo,
        'album' : currentSong.getAlbum(),
        'year' : trackMetadata.date
      }

      if (nextSong) {

        var nextSongObj = {
            'id' :  nextSong.getId(),
            'name' :  nextSong.getDisplayName(),
            'artist' : nextSong.getArtist(),
            'album' : nextSong.getAlbum(),
        }

        songObject.next = nextSongObj;
      }

      return songObject;
		}

	}

	var getDirectory = function(dirPath) {
		var directoryContents = [];
		var deferred_directoryContents = $q.defer();

		  // Get directories:
		  mpdClient.getDirectoryContents(dirPath, function(directoryFiles){
				// console.log(dirPath);
		    directoryFiles.forEach(function(directoryItem){
		      var metaData 	= directoryItem.getMetadata();
		      var path     	= directoryItem.getPath();
					var trackId		= metaData.track;

					if (typeof metaData.track !== 'undefined') {
						var track = directoryItem.getTrack();
						// console.log(track);
						var queueSong = directoryItem.getQueueSong();
						if (queueSong) {
							trackId = queueSong.getId();
						}
						// console.log(trackId);
					}
					// console.log(directoryItem);

					// if (typeof path !== 'undefined') {
						// var dirName = path.replace(/\//g, '/');
						var pathArray = path.split('/');
						var dirName = pathArray[pathArray.length-1];
						var itemData = {
							'dirname': dirName,
							'path': path,
							'pathArray': pathArray,
							'modified': metaData.last_modified,
							'trackId': trackId,
							'track': metaData.title,
							'album': metaData.album,
							'link': encodeURIComponent(path.replace("/", "@!@"))
						}
			      directoryContents.push(itemData);
					// }
		    });
				// console.log(directoryContents);
		  });

			$timeout(function() {
				deferred_directoryContents.resolve(directoryContents);
			}, 750);

			return deferred_directoryContents.promise;

	}

	var currentQueue = function(){
		var mpdQueue		 = mpdClient.getQueue();
		var currentSong	 = mpdClient.getCurrentSongID();

  	mpdQueue.getSongs().forEach(function(playlistSong){
			var songObject = {
				'id' :  playlistSong.getId(),
				'name' :  playlistSong.getDisplayName(),
				'duration' : playlistSong.getDuration(),
				'artist' : playlistSong.getArtist(),
				'album' : playlistSong.getAlbum(),
				'year' : playlistSong.date
			}
			// console.log(songObject);
		})

		return currentSong;
	}

	var getMsg = function(){
		var deferred = $q.defer();
    $timeout(function() {
      deferred.resolve(['Hello', 'world!']);
    }, 2000);

    return deferred.promise;

	}

	return {

    getPlaying: function() {
    	return getPlaying();
    },

    currentQueue: function() {
    	return currentQueue();
    },

    getDirectory: function(dirPath) {
    	return getDirectory(dirPath);
    },

		getMsg:getMsg

	}

});
