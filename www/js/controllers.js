angular.module('starter.controllers', [])

.controller('flashScreenCtrl', function($scope, $ionicPlatform, $timeout, $interval, $state, $cordovaSQLite, emws_api, etmRestaurant) {
  $timeout(function () {
    emws_api.checkLocalStorage();
  }, 2000);
})

.controller('loadingScreenCtrl', function($scope, $ionicPlatform, $timeout, $state, $cordovaSQLite, emws_api, etmRestaurant) {
  //page loading...
  $scope.$watch(function () { return etmRestaurant.pbar_count }, function (newVal, oldVal) {
      if (typeof newVal !== 'undefined') {
          $scope.loading = etmRestaurant.pbar_count;
      }
  });

  $scope.$watch(function () { return etmRestaurant.pbar_total_count }, function (newVal, oldVal) {
      if (typeof newVal !== 'undefined') {
          $scope.total = etmRestaurant.pbar_total_count;
      }
  });

  emws_api.localLoading();
})

.controller('offersFrontCtrl', function($scope, $state, emws_api, etmRestaurant) {

  if(etmRestaurant.store_status == 1) {
    $scope.store_status = "NEW OPEN";
  } else {
    $scope.store_status = "CLOSE NOW";
  }

  emws_api.getOffers()
  .success(function(data) {
    $scope.offer_html = data;
  })
  .error(function(err) {
    alert("Network Connnection Error!");
  });

  $scope.go_home_screen = function() {
    $state.go("tab.home");
  };
})

.controller('signinCtrl', function($scope, $ionicPlatform, $timeout, $state, REGX, signinService, sessionStorageService, emws_api, $cordovaSQLite) {
  // Form data for the login modal
  $scope.loginData = {
    email : "klaas.fongert@hotmail.com",
    password : "123456"
  };

  $scope.msg = "";

  $scope.doLogin = function(loginData) {
    //if ($scope.loginForm.$valid){

      if(!loginData.email) {
        alert("Please input your email address!");
        return;
      } else if (!REGX.validEmail(loginData.email)) {
        alert("Please input valid email!");
        return;
      }

      if(!loginData.password) {
        alert("Please input your password!");
        return;
      }

      signinService.login(loginData.email, loginData.password)
      .success(function(data) {
          if (data['success']) {
              window.localStorage.removeItem('customer_id');
              window.localStorage.removeItem('address_id');
              window.localStorage.setItem('customer_id', data['success'].customer_id);
              window.localStorage.setItem('address_id', data['success'].address_id);
              window.localStorage.setItem('customer', data['success']);

              emws_api.myAccount();
              sessionStorageService.from_loginpage =  "yes";
              emws_api.orderStatus();
              // cartdetails();
          }
          if (data['error']) {
              $scope.msg = cust['error'];
              return;
          }
      })
      .error(function(error) {
          alert("Sorry, System Error!");
      });
      /*
      $timeout(function() {
        $state.go('tab.dash');
      }, 1000);*/
      //}
  };
})

.controller('signupCtrl', function($scope, $timeout, $ionicHistory, $state) {

  // Form data for the login modal
  $scope.signupData = {};

  $scope.goBack = function() {
    //alert($ionicHistory.backTitle());
    $ionicHistory.goBack();
  };

  $scope.doSignup = function(data) {
    //if ($scope.loginForm.$valid){
      console.log('Doing singup', $scope.signupData);

      $timeout(function() {
        $state.go('tab.dash');
      }, 1000);
      //}
  };
})

.controller('forgotCtrl', function($scope, $timeout, $ionicHistory, $state) {

  // Form data for the login modal
  $scope.data = {
    email : ""
  };

  $scope.goBack = function() {
    //alert($ionicHistory.backTitle());
    $ionicHistory.goBack();
  };

  $scope.doSubmit = function(data) {
    //if ($scope.loginForm.$valid){
      console.log('Doing Submit', $scope.data);

      $timeout(function() {
        $state.go('tab.dash');
      }, 1000);
    //}
  };
})

.controller('homeScreenCtrl', function($scope, homeScreenService, etmRestaurant, $interval, $cordovaSQLite, $http, HEADERS) {
  // console.log(homeScreenService.getCategories());
  $scope.cate = "";

  etmRestaurant.menuthemelevel = 1;

  if (etmRestaurant.localloding_IntervalID) {
      $interval.cancel(etmRestaurant.localloding_IntervalID);
  }

  var query = "SELECT localkey,localvalue FROM localDB WHERE localkey='menus'";

  $cordovaSQLite.execute(etmDB, query).then(function(res) {
      menu = angular.fromJson(res.rows.item(0).localvalue);

      $scope.cate = menu['menus'];
      console.log($scope.cate);
      /*
      html = menus_html(menus['menus']);
      $('#c1').html(html);
      $('#c1').trigger('create');
      $('#c1').listview('refresh');
      */
  }, function (err) {
      data = {};

      $http({
          method: 'POST',
          url: etmRestaurant.url + 'getMenus',
          headers: HEADERS
      })
      .success(function(data)
      {
          $scope.cate = data["menus"];
          /*
          html = menus_html(menus['menus']);
          $('#c1').html(html);
          $('#c1').listview().trigger('create');
          $('#c1').listview('refresh');
          */
      })
      .error(function(error)
      {
        alert("Network Connection Error!");
      });

  });
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
