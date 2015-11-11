// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var etmDB = null;
var mapkey = "AIzaSyA2CyLTbQFt4CUYZ5hkz_MOZzkUcTPsLU8";

var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
  //document.write('<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=' + mapkey + '&v=3&sensor=false&language=en"></script>');

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    if(window.cordova) {
      // App syntax
      etmDB = $cordovaSQLite.openDB({ name: "etmRestaurantDB.db" });

    } else {
      // Ionic serve syntax
      etmDB = window.openDatabase("etmRestaurantDB.db", "1.0", "etm app", -1);
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider

  .state('pageloading', {
    url: '/pageloading',
    templateUrl: 'templates/pageLoading.html',
    controller: 'loadingScreenCtrl'
  })


  .state('flashscreen', {
    url: '/flashscreen',
    templateUrl: 'templates/flashscreen.html',
    controller: 'flashScreenCtrl'
  })

  .state('signin', {
    url: '/signin',
    templateUrl: 'templates/signin.html',
    controller: 'signinCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('forgotpassword', {
    url: '/forgotpassword',
    templateUrl: 'templates/forgetpassword.html',
    controller: 'forgotCtrl'
  })

  .state('pageOffersFront', {
    url: '/pageOffersFront',
    templateUrl: 'templates/pageOffersFront.html',
    controller: 'offersFrontCtrl'
  })

  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'homeScreenCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/flashscreen');

});
