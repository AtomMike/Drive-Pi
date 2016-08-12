angular.module('DrivePi.directives', [])

.directive('backgroundImg', function($timeout, MPDServices){
  return {
    restrict: "EA",
    scope: {
      currentTrackInfo: '='
    },
    link: function(scope, element, attrs){

      attrs.$observe('backgroundImg', function(val){

        $timeout(function(){
          val = val.split(' ').join('-');
          valArr = val.split('/');
          artworkPath = [];
          if ( valArr[0].toLowerCase() == 'music') {
            valArr.splice(0,1);
          };
          for (var i = 0; i < valArr.length; i++) {
            artworkPath[i] = valArr[i].toLowerCase();
            if ( i == 1 ) {
              console.log('Album found... ',valArr[i]);
              break;
            }
          };
          val = valArr.join('/');
          artworkPath = artworkPath.join('/');

          // Wrap any brackets with slashes:
          artworkPath = artworkPath.replace('(', '\\(');
          artworkPath = artworkPath.replace(')', '\\)');

          element.css({
            'background-image': 'url(img/albums/' + artworkPath +'/cover.jpg)'
          });
        });

      });

    }
  }
})

.directive("trackItem", function() {
  return {
    restrict : "E",
    scope : {
      currentlyPlaying : '=',
      dirName : '=',
      dirSelectFunction : '&'
    },
    templateUrl : "views/partials/track-list-item.html",

    controller: function($scope, $rootScope, $timeout,  NowPlayingFactory){

      $scope.iAmCurrentTrack = false;

      $scope.dirSelected = function(itemType, path, trackId){
        $rootScope.$emit('dir.selected', {itemType:$scope.itemType, path:$scope.myPath, trackId:$scope.trackId});
      }

      $scope.checkIfCurrent = function(){
        /* --- Get the id of the currently playing track: --- */
        var currentTrackInfo = NowPlayingFactory.get();
        var currentTrackPath;

        if (currentTrackInfo !== undefined) {
          currentTrackPath = currentTrackInfo.path;
          // console.log('NowPlayingFactory path : ', currentTrackPath);
          // console.log('$scope.myPath : ',$scope.myPath);
          if (currentTrackPath == $scope.myPath) {
            console.log('yes, it is the same path: ', currentTrackPath);
            $scope.iAmCurrentTrack = true;
          }
          // currentTrackId = parseInt(currentTrackId.substr(0, currentTrackId.indexOf('/')));
        }

        //
        // /* --- Get this track's id: --- */
        // if ($scope.trackId == currentTrackId) {
        //   console.log('yes!');
        // }
      }

      $timeout(function(){
        $scope.checkIfCurrent();
      });

    },
    link: function(scope, elem, attrs, NowPlayingFactory, $timeout) {

      // var amiplaying = scope.currentHighlight(1);

      // When clicked, call dirSelect:
      // elem.bind('click', function() {
      //   scope.$apply(function(){
      //     // scope.dirSelect({'type':'typeee'});
      //     var fn = $parse(attrs.dirSelect);
      //     fn(scope, {$event : e});
      //   });
      // });

      // console.log(scope.currentlyPlaying);

      attrs.$observe('dirname', function(val){
        scope.title = val;
      });
      attrs.$observe('itemtype', function(val){
        scope.itemType = val;
      });
      attrs.$observe('trackid', function(val){
        scope.trackId = val;
      });
      attrs.$observe('dirpath', function(val){
        scope.myPath = val;
      });
    }
  };
});
