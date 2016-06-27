angular.module('DrivePi.controllers', [])

.controller('AppCtrl', function( $scope, $window, $interval, MPDServices ) {
  $scope.nowPlaying = {};
  $scope.mpdStatus = "Waiting for connection...";
  $scope.nowPlaying = {};
  $scope.nowPlaying.artist = 'Awaiting queue...';
  $scope.progressBarWidth = 0;
  var progressBarTrackWidth = 0;
  // console.log(mpdClient);

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
          var nowPlaying = MPDServices.getPlaying();
        }
        $scope.nowPlaying = nowPlaying;
        $scope.currentQueue = MPDServices.currentQueue();

        progressBarTrackWidth = angular.element(document.querySelectorAll('.progress-bar-bg'))[0].clientWidth;
        duration = nowPlaying.duration;
        playTime = nowPlaying.playTime;
        // console.log(duration);
        // console.log(playTime);
        percentage = (100 / duration) * playTime;
        $scope.progressBarWidth = percentage;
      }

    }else{
      // TODO: Check if we can failsafe the connection/reconnection
      $scope.mpdStatus = "Disconnected";
      console.log('Reconnecting...');
    };

    // Clock
    $scope.getTime = function(){
      var date = new Date();
      hrs  = date.getHours();
      mins = date.getMinutes();
      secs = date.getSeconds();
      hrs = ("0" + hrs).slice(-2);
      mins = ("0" + mins).slice(-2);
      time = hrs + ':' + mins;

      return time;
    };

  }, 1000);
})

.controller('HomeCtrl', function( $scope, $window, $interval ) {
})

.controller('MusicCtrl', function( $scope, $stateParams, $window, $interval, $timeout, MPDServices ) {
  var basePath = 'Music';
  var testPath = 'Music/Ott_/Skylon';
  var params = $stateParams;
  var dirName = '';
  var isAlbum = false;

  // Clear-out the DB and add any new music:
  mpdClient.updateDatabase();

  $scope.currentDirectory = [];

  function getNewDirectory(path){

    $timeout(function() {

        MPDServices.getDirectory(path).then(function(dirContents){

          console.log(dirContents);
          $scope.directoryContents = [];

          if (dirContents !== undefined) {
            $scope.currentDirectory = dirContents;

            if (dirContents[0] && dirContents[0].album) {
              isAlbum = true;
            }else {
              isAlbum = false;
            }

            dirContents.forEach(function(dirItem){

              if (dirItem.track) {
                // This is a music track, so treat it as playable...
                trackName = dirItem.track;
                dirItem.itemType = 'track';
                // path = path.substr(0, path.lastIndexOf('/'));
              }else{
                dirItem.itemType = 'dir';
              }
              $scope.directoryContents.push(dirItem);

            });

          }
        });

      })

  };

  $scope.getAlbumTitle = function(){
    var artist = '';
    var album = '';
    var item = $scope.currentDirectory;

    if (item) {
      if (item[0]) {
        var pathArray = item[0].pathArray;

        // Is this item at the media root level?
        if (pathArray.length < 3) {
          artist = '';
        }else{
          artist = pathArray[1];
        }

        if (item[0].album) {
          album = ' - ' + item[0].album;
        }
      }
    }
    return artist + album;
  }

  getNewDirectory(basePath);

  $scope.dirSelect = function(type, path, trackId){
    if (type == 'track') {

      if (isAlbum) {
        clearPlaylist();
        path = path.substr(0, path.lastIndexOf('/'));
        addToPlaylist(path);
      }

      trackId = trackId;
      mpdClient.play(trackId);
    }else{
      getNewDirectory(path);
    }
    // $scope.dirData = MPDServices.getDirectory(path);
      // console.log($scope.dirData.dirName);
    // if ($scope.dirData[0].track !== undefined && $scope.dirData[0].track !== ' ') {
    //   console.log('this is a tune!');
    // }
      // console.log($scope.dirData);
  };

  // Wipe the playlist:
  clearPlaylist = function(){
    mpdClient.clearQueue();
    console.log('cleared playlist...');
  }

  // Add track(s) to the queue so that they may be played:
  addToPlaylist = function(path){
    mpdClient.addSongToQueueByFile(path);
    console.log('added track to playlist...');
  };

  // UI input
  $scope.swipeLeft = function(){
    console.log('u swipe me left!');
  }

})

.controller('RadioCtrl', function( $scope, $window, $interval ) {
})

.controller('PhoneCtrl', function( $scope, $window, $interval ) {
})

.controller('NavigationCtrl', function( $scope, $window, $interval ) {

   var mySwiper = new Swiper ('.swiper-container', {
     // Optional parameters
     direction: 'vertical',
     loop: false,
     scrollbar: '.swiper-scrollbar',
     touchRatio: 1,
     freeMode: true
   })

})
