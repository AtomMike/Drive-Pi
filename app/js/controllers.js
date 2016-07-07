angular.module('DrivePi.controllers', [])


.controller('AppCtrl', function( $scope, $window, $interval, $timeout, MPDServices, Storage ) {
  $scope.nowPlaying = {};
  $scope.mpdStatus = "Waiting for connection...";
  $scope.nowPlaying = {};
  $scope.nowPlaying.artist = 'Awaiting queue...';
  $scope.progressBarWidth = 0;
  $scope.isAlbum = false;
  $scope.currentlyPlaying = false;
  $scope.duration = 0;
  $scope.playTime = 0;

  progressBarUpdate = function(sliderId, modelValue, highValue, pointerType){
    console.log(sliderId, modelValue, highValue, pointerType);

    // Get percentage in seconds:
    if ( $scope.playState === 'play') {
      var newSecs = (modelValue * $scope.duration) / 100;
      mpdClient.seek(newSecs);
      // $scope.duration = 0;
      // $scope.playTime = 0;
      console.log($scope.duration, newSecs);
      // $scope.progressBar.value = newSecs;
    }
  }

  $scope.progressBar = {
    value: 0,
    options: {
      showSelectionBar: true,
      floor: 0,
      ceil: 100,
      onChange: progressBarUpdate
    }
  };

  var stateLoaded = false;
  var progressBarTrackWidth = 0;

  // Clear-out the DB and add any new music:
  mpdClient.clearQueue();
  mpdClient.updateDatabase();

  // Restore the last song state from local storage:
  dataStore = Storage.restore();

  // Add track(s) to the queue so that they may be played:
  addToPlaylist = function(path){
    mpdClient.addSongToQueueByFile(path);
    console.log('added track to playlist...');
  };

  // Wipe the playlist:
  clearPlaylist = function(){
    mpdClient.clearQueue();
    console.log('cleared playlist...');
  }

  clearPlaylist();

  $scope.checkConnection = $interval(function() {

    var mpdState = mpdClient.getState();

    if (mpdState.connected) {

      // Initialise in last state if saved:
      if (dataStore && stateLoaded == false) {
        console.log(dataStore);
        $timeout(function() {
          var path = dataStore.songPath;
          getNewDirectory(path);
          // addToPlaylist(path);

          // If last track and we're set to Album Repeat, go to track '0' (first track)
          // mpdClient.play(0);
          stateLoaded = true;
        })
      }

      $scope.mpdStatus = 'Connected';
      $scope.playState = mpdClient.getPlaystate();

      if ( $scope.playState === 'stop' || $scope.playState === 'pause' ) {
        return;
      }

      if ( $scope.playState === 'play') {
        // Currently playing, so get the track's info:
        if (typeof $scope.currentlyPlaying == "object") {
          var nowPlaying = $scope.currentlyPlaying;
        } else {
          var nowPlaying = MPDServices.getPlaying();
        }
        $scope.nowPlaying = nowPlaying;
        $scope.currentQueue = MPDServices.currentQueue();

        // progressBarTrackWidth = angular.element(document.querySelectorAll('.progress-bar-bg'))[0].clientWidth;
        $scope.duration = nowPlaying.duration;
        $scope.playTime = nowPlaying.playTime;
        percentage = (100 / $scope.duration) * $scope.playTime;
        $scope.progressBarWidth = percentage;
        $scope.progressBar.value = percentage;
      }else{
        // Not currently playing anything. Try and jump back in to the last song:

        // console.log('Not currently playing. Will try and jump back in to the last song...');
      }

    }else{
      // TODO: Check if we can failsafe the connection/reconnection
      $scope.mpdStatus = "Disconnected";
      console.log('Reconnecting...');
    };

    // Clock - return the time as a string:
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

  // Stop the current tune:
  $scope.stopMusic = function(){
    mpdClient.stop();
    $scope.playState = 'stop';
    console.log('stopping: '+$scope.nowPlaying.id);
    mpdClient.removeSongFromQueueById( $scope.nowPlaying.id );
    $scope.nowPlaying = false;
  }

  // Pause the current tune:
  $scope.pauseMusic = function(){

    if ($scope.playState === 'play') {
      mpdClient.pause(true);
      $scope.playState = 'pause';
    } else {
      mpdClient.pause(false);
      $scope.playState = 'play';
    }

  }

  // Play next track:
  $scope.nextSong = function(){

    var songId = $scope.nowPlaying.next.id;
    console.log(songId);
    mpdClient.stop();
    mpdClient.playById( songId );

    $scope.playState = 'play';

  }

  // Play previous track:
  $scope.prevSong = function(){
  }

// Get the current directory:
    $scope.currentDirectory = [];
    getNewDirectory = function(path){

      $timeout(function() {

          MPDServices.getDirectory(path).then(function(dirContents){

            // console.log(dirContents);
            $scope.directoryContents = [];

            if (dirContents !== undefined) {
              $scope.currentDirectory = dirContents;

              if (dirContents[0] && dirContents[0].album) {
                $scope.isAlbum = true;
              }else {
                $scope.isAlbum = false;
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
})



.controller('HomeCtrl', function( $scope, $window, $interval ) {
})



.controller('MusicCtrl', function( $scope, $stateParams, $window, $interval, $timeout, MPDServices, Storage ) {

  var basePath = 'Music';
  var params = $stateParams;
  var dirName = '';

  if (dataStore) {
    basePath = dataStore.songPath;
  }


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

  addAlbum = function(path){
    clearPlaylist();
    path = path.substr(0, path.lastIndexOf('/'));
    addToPlaylist(path);
  }

  $scope.dirSelect = function(type, path, trackId){
    console.log('dirselect');
    if (type == 'track') {

      console.log('isAlbum '+$scope.isAlbum);
      if ($scope.isAlbum == true) {
        addAlbum(path);
      }

      trackId = trackId;
      mpdClient.play(trackId);

      // Save the current song state: -- Move into a factory --
      $timeout(function() {
        var newSongInfo = mpdClient.getCurrentSong();
			  var trackMetadata = newSongInfo.getMetadata()
        var songObject = {
          'songId': newSongInfo.getId(),
          'songPath': path,
          'songTitle': newSongInfo.getTitle(),
          'songPlayTime': mpdClient.getCurrentSongTime(),
          'songDuration': newSongInfo.getDuration(),
          'songArtist': newSongInfo.getArtist(),
          'songAlbum': newSongInfo.getAlbum(),
          'songYear': trackMetadata.date,
        };

        // Update the local Storage:
  			dataStore = songObject;
  			Storage.save();
      }, 1000);

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

  // UI input
  $scope.swipeLeft = function(){
    console.log('u swipe me left!');
  }

  $scope.navToRoot = function(){
    console.log('Go to root...');
    var path = 'Music';
    getNewDirectory(path);

    // if ($scope.isAlbum == true) {
    //   addAlbum(path);
    // }
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
