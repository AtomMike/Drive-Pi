angular.module('DrivePi.controllers', [])

.controller('AppCtrl', function( $scope, $window, $interval, mpdServices ) {
  $scope.nowPlaying = {};
  // $scope.nowPlaying.artist = 'Underworld';
  // $scope.nowPlaying.track = "Pearl's Girl";
  $scope.mpdStatus = "Waiting for connection...";
  $scope.currentlyPlaying = false;

  $scope.checkConnection = $interval(function() {
    var mpdState = mpdClient.getState();

    if (mpdState.connected) {
      $scope.mpdStatus = "Connected";
      $scope.playState = mpdClient.getPlaystate();
      // console.log($scope.playState);

      if ( $scope.playState === 'play') {
        if (typeof $scope.currentlyPlaying == "object") {
          var nowPlaying = $scope.currentlyPlaying;
        } else {
          var nowPlaying = mpdServices.getPlaying();
        }
        $scope.nowPlaying = nowPlaying;
        // console.log(nowPlaying);
      }

      // Get directories:
      var dirPath = 'Music/Ott_/Skylon';
      var dirContents = mpdClient.getDirectoryContents(dirPath, function(directoryFiles){
		    var directoryPlaylists = [];
        directoryFiles.forEach(function(directoryItem){
          var metaData = directoryItem.getMetadata();
          var path     = directoryItem.getPath();
          // console.log(path);
					directoryPlaylists.push(path);
        });
        $scope.directoryItems = directoryPlaylists;
      });

      // Playlists:
      mpdClient.lsPlaylists();
      $scope.PlaylistData = mpdClient.getPlaylists();
      $scope.$watch('PlaylistData', function (playlistData) {
        if (playlistData) {
            // console.log(playlistData);
        }
      });

    };

  }, 1000);
})

.controller('HomeCtrl', function( $scope, $window, $interval ) {
})

.controller('MusicCtrl', function( $scope, $window, $interval ) {
})

.controller('RadioCtrl', function( $scope, $window, $interval ) {
})

.controller('PhoneCtrl', function( $scope, $window, $interval ) {
})

.controller('NavigationCtrl', function( $scope, $window, $interval ) {
})
