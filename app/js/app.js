mpdClient = MPD(8800);

// Declare app level module which depends on views, and components
angular.module('DrivePi', [
  'ui.router',
  'DrivePi.controllers',
  'DrivePi.directives',
  'DrivePi.music',
  'rzModule'
])

.config(function($urlRouterProvider, $stateProvider) {

  $urlRouterProvider.otherwise('/home');

  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      controller: 'AppCtrl'
    })

    .state('home', {
      url: '/home',
      cache: false,
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl'
    })

    .state('music', {
      url: '/music?param?',
      cache: false,
      templateUrl: 'views/music.html',
      controller: 'MusicCtrl',
      params: {
        directory: {
            value: '0'
        }
      }
    })

    .state('songlist', {
      url: '/music/songlist',
      cache: false,
      templateUrl: 'views/partials/songlist.html',
      controller: 'MusicCtrl'
    })

    .state('favourites', {
      url: '/music/favourites',
      cache: false,
      templateUrl: 'views/partials/favourites.html',
      controller: 'MusicCtrl'
    })

    .state('radio', {
      url: '/radio',
      cache: false,
      templateUrl: 'views/radio.html',
      controller: 'RadioCtrl'
    })

    .state('phone', {
      url: '/phone',
      cache: false,
      templateUrl: 'views/phone.html',
      controller: 'PhoneCtrl'
    })

    .state('navigation', {
      url: '/navigation',
      cache: false,
      templateUrl: 'views/navigation.html',
      controller: 'NavigationCtrl'
    });
} );
