angular.module('DrivePi.controllers', [])

.controller('mainNavCtrl', function($scope, $state, $rootScope, $timeout){
  $scope.currentPage = 'home';

  /* Nav/tabs */
  $scope.navItemActive = function(navItem){
    if ($scope.currentPage == navItem) {
      return 'active';
    }
  }

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    $scope.currentPage = toState.name;
    console.log('statechange: ' + $scope.currentPage);
    $scope.navItemActive();
  });

  $timeout(function(){
    // console.log($state.current.name);
    $scope.currentPage = $state.current.name;
  })

  $scope.navItemActive();
  /* --- */

})

.controller('AppCtrl', function( $scope, $state, $window, $interval, $timeout, MPDServices, Storage ) {

  $scope.trackPlaying = false;
  $scope.nowPlaying = {};
  $scope.nowPlaying.artist = 'Awaiting queue...';
  $scope.mpdStatus = 'Waiting for connection...';
  $scope.progressBarWidth = 0;
  $scope.isAlbum = false;
  $scope.currentlyPlaying = false;
  $scope.duration = 0;
  $scope.playTime = 0;
  // $scope.lastNavigatedPath = '';

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
  console.log('datastore: ',dataStore);

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
        // console.log(dataStore);
        $timeout(function() {
          var path = dataStore.songPath;
          $scope.getNewDirectory(path);
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
        $scope.trackPlaying = true;
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

  }, 1000);


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

  $scope.getViewTitle = function(){
    // $timeout(function(){
      return $state.current.name;
    // })
  }

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
    // $scope.itemHighlighted = songId;

  }

  // Play previous track:
  $scope.prevSong = function(){

    if ($scope.nowPlaying.queuePosition > 0) {
      var songId = $scope.nowPlaying.id - 1;
      mpdClient.stop();
      mpdClient.playById( songId );
      $scope.playState = 'play';
      // $scope.itemHighlighted = songId;
    }

  }

  $scope.canSkipBackward = function(){

    if ($scope.nowPlaying.queuePosition > 0) {
      return true;
    }else{
      return false
    }

  }

  $scope.canSkipForward = function(){

    if ($scope.nowPlaying.next) {
      return true;
    }else{
      return false
    }

  }

// Get the current directory:
    $scope.currentDirectory = [];
    $scope.getNewDirectory = function(path){

      $timeout(function() {

          MPDServices.getDirectory(path).then(function(dirContents){

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

    $scope.songSearch = function(){
      $scope.results = [];
      console.log('click');
      // console.log(mpdClient.getTagTypes());

      mpdClient.tagSearch(
        'title',
        {artist: 'ABC'},
        function(res){
          console.log( res );
        }
      );

      // mpdClient.tagSearch(
      //      'album',
      //      {artist:'abc'},
      //      function(albums){
      //         console.log(albums);
      //      }
      //  );
    }
})



.controller('HomeCtrl', function( $scope, $window, $interval ) {
})



.controller('MusicCtrl', function( $scope, $rootScope, $stateParams, $window, $interval, $timeout, MPDServices, Storage, NowPlayingFactory ) {

  $scope.basePath = 'Music';
  var params = $stateParams;
  var dirName = '';

  $scope.currentQueue = [];

  $scope.returnAlbumPath = function(path){
    path_array = path.split('/');
    var album_path = [];
    for (var i = 0; i < path_array.length; i++) {
      if ( (path_array[i].indexOf('mp3') !== -1) || (path_array[i].indexOf('mp4') !== -1) || (path_array[i].indexOf('m4a') !== -1) ) {
        break;
      }
      album_path.push(path_array[i]);
    }

    return album_path.join('/');
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

  addAlbum = function(path){
    clearPlaylist();
    path = path.substr(0, path.lastIndexOf('/'));
    addToPlaylist(path);
  }

  $scope.dirSelect = function(type, path, trackId){

    if (trackId) {
      /* Check what format the id is in, */
      /* as sometimes it may be 'x/y', or simply 'x': */
      if ( trackId.indexOf('/') !== -1 ) {
        trackId = trackId.substr(0, trackId.lastIndexOf('/'));
      }
      trackId = parseInt(trackId)-1;
    }

    $timeout(function() {

      if (type == 'track') {

        if ($scope.isAlbum == true) {
          addAlbum(path);
        }

        trackId = trackId;

        mpdClient.play(trackId);
        $scope.currentlyPlaying = mpdClient.getCurrentSong();

        /* --- Update the nowplaying factory --- */
        NowPlayingFactory.set( {'itemType':type, 'path':path, 'trackId':trackId} );

        $scope.currentQueue = MPDServices.currentQueue();

        // Save the current song state: -- Move into a factory! --
        $timeout(function() {
          var newSongInfo = mpdClient.getCurrentSong();
  			  var trackMetadata = newSongInfo.getMetadata();
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
    			dataStore.currentSong = songObject;
    			Storage.save();
        }, 1000);

      }else{
        $scope.getNewDirectory(path);
      };

      lastNavigatedPath = path;

     });

  };

  // UI input
  $scope.swipeLeft = function(){
    console.log('u swipe me left!');
  }

  $scope.navToRoot = function(){
    console.log('Go to root...');
    var path = 'Music';
    $scope.getNewDirectory(path);
  }
  $scope.navGoBack = function(){
    // console.log('going back a level.');
    var navPath = lastNavigatedPath.split('/');
    var prevLevel = [];
    for (var i = 0; i < navPath.length-1; i++) {
      prevLevel[i] = navPath[i];
    }
    if ( prevLevel.length > 2 ) {
      prevLevel.pop();
    }

    $scope.dirSelect('', prevLevel.join('/'));
  }

  $rootScope.$on('dir.selected', function(event, val){
    // console.log('NowPlayingFactory ',NowPlayingFactory.get());
    $scope.dirSelect(val.itemType, val.path, val.trackId);
  });



  /* Get the album path to navigate to if coming from another tab */
  // if (dataStore) {
  //   albumPath = $scope.returnAlbumPath(dataStore.songPath);
  //   basePath = albumPath;
  //   console.log(basePath);
  // }

  if ( lastNavigatedPath ) {
    $scope.getNewDirectory($scope.returnAlbumPath(lastNavigatedPath));
  }else{
    $scope.getNewDirectory($scope.basePath);
  }

})



.controller('RadioCtrl', function( $scope, $window, $interval, $http, $httpParamSerializerJQLike ) {

  $scope.tuneUp = function(){

    $http({
      url: '../php/radio_tune.php',
      method: 'POST',
      cache: false,
      data: $httpParamSerializerJQLike({
        'action': 'tune_up'
      }),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      console.log('success response', data);
    }).error(function(xhr, desc, err){
      console.log(xhr);
      console.log("Details: " + desc + "\nError:" + err);
    });

  };

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
