angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('REGX', function() {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return {
    validEmail : function(email) {
      return re.test(email);
    }
  }
});

function toparams(obj) {
  var p = [];
  for (var key in obj) {
      p.push(key + '=' + encodeURIComponent(obj[key]));
  }

  return p = p.join('&');
}

function cat_subs(menus) {
  cats = [];
  for (i in menus) {
      category = menus[i];
      cats.push({category_id: category['category_id'], products: category['products']});
      if (category['categories'] && category['categories'].length > 0) {
          cats = cats.concat(cat_subs(category['categories']));
      }
  }
  return cats;
}

app.service('currentUserService', function(){
  this.id = null;

  this.cust_fname = "";
  this.cust_lname = "";
  this.cust_email = "";
  this.cust_telephone = "";
  this.cust_address_id = "";
});

app.service('sessionStorageService', function(){
  this.from_loginpage = "";
});

app.service('etmRestaurant', function(mobilesite_url) {
  this.url = mobilesite_url + 'mobileapi/';
  this.pincode = "";
  this.username = "";
  this.password = "";
  this.first_dwnd_cound = 1;
  this.pbar = '';
  this.pbar_count = 0;
  this.pbar_total_count = 10;
  this.product_id = '';
  this.per_count = 0;
  this.deal_opt_count = 0;
  this.item_count = 0;
  this.cart = [];
  this.temp_cart = [];
  this.delete_keys_arr = [];
  this.added_count = 0;
  this.per_item_count = 0;
  this.added_items = [];
  this.products_IDs = [];
  this.category_products = [];
  this.selected_product = [];
  this.localstoragesize = 0;
  this.deal_selected_count = 0;
  this.req_radio_count = 0;
  this.localloding_complete = true;
  this.localloding_IntervalID = null;
  this.menuthemelevel = 0;
  this.ref = '';
  this.payment_success = 0;
  this.error_continue_page = '';
  this.frontOffers_page = 0;
  this.validate = 0;
  this.temp_itemcount = 0;
  this.page_num = 0;
  this.storelat = 0;
  this.storelong = 0;
});

app.service('emws_api', function($state, $http, $ionicPlatform, $cordovaSQLite, $ionicHistory, currentUserService, etmRestaurant, HEADERS, $ionicLoading, $interval ) {

  var self  = this;

  this.showLoading = function(message) {
    message = message || "...";

    // Show the loading overlay and text
    $ionicLoading.show({

      // The text to display in the loading indicator
      template: '<div><ion-spinner icon="android"></ion-spinner><p>' + message + '</p></div>',

      // The animation to use
      animation: 'fade-in',

      // Will a dark overlay or backdrop cover the entire view
      showBackdrop: true,

      // The maximum width of the loading indicator
      // Text will be wrapped if longer than maxWidth
      maxWidth: 200,

      // The delay in showing the indicator
      showDelay: 0
    });
  };

  this.hideLoading = function() {
    $ionicLoading.hide();
  };

  // for loading screen
  this.localLoading = function() {
    etmRestaurant.localloding_complete = false;
    window.localStorage.setItem("loading_start", "true");
    etmRestaurant.pbar_total_count=10;
    etmRestaurant.pbar_count=0;
    /*
    var test = $interval(function () {
      if(etmRestaurant.pbar_count == 10) $interval.cancel(test);
      etmRestaurant.pbar_count++;
    }, 1000);
    */
    etmRestaurant.localloding_IntervalID = $interval(function() {
        if (etmRestaurant.localloding_complete) {

            $interval.cancel(etmRestaurant.localloding_IntervalID);
            self.getstoreinfo();
        }
    }, 1000);


    $ionicPlatform.ready(function() {

      $cordovaSQLite.execute(etmDB, 'DROP TABLE IF EXISTS localDB');
      $cordovaSQLite.execute(etmDB, 'CREATE TABLE IF NOT EXISTS localDB (localkey TEXT PRIMARY KEY,localvalue TEXT)');
      $cordovaSQLite.execute(etmDB, 'DROP TABLE IF EXISTS productsDB');
      $cordovaSQLite.execute(etmDB, 'CREATE TABLE IF NOT EXISTS productsDB (product_id INTEGER PRIMARY KEY,product TEXT)');
      $cordovaSQLite.execute(etmDB, 'DROP TABLE IF EXISTS menutoproductsDB');
      $cordovaSQLite.execute(etmDB, 'CREATE TABLE IF NOT EXISTS menutoproductsDB (category_id INTEGER ,product_id INTEGER)');

      self.getMenus();
    });

  };

  this.getstoreinfo = function() {
    $http({
      method: 'POST',
      url: etmRestaurant.url + 'getstoreinfo',
      headers: HEADERS
    })
    .success(function(data)
    {
        contact = '';
        opening_hours = '';
        window.localStorage.setItem("storeinfo", data);
        window.localStorage.setItem("storeinfotime", new Date());

        self.checkLocalStorage();
    })
    .error(function(error)
    {
        clearInterval(etmRestaurant.localloding_IntervalID);
        alert("Network Connection Error!");
    });
  };

  //for flash screen
  this.checkLocalStorage = function() {

      self.getstoreopened();

      etmRestaurant.frontOffers_page = 1;
      //cat_last_modified : is defined in getMenu
      //loading_start : is defined with true in LoadingPageScreen, then is removed in localLoading()->getMenus()->getProducts()->products_lS_recursive()

      if (!(window.localStorage.cat_last_modified) || window.localStorage.loading_start) { //whether menu is loaded in localdatabase ?
          $state.go("pageloading");
      }
      else if (!(window.localStorage.customer_id)) { // when user is not logined, show OfferPage

          self.getOffers()
          .success(function(existoffer) {
              $state.go("pageOffersFront");
          })
          .error(function(error) {
              alert("Network Connection Error!");
          });
      }
      else {
          window.sessionStorage.setItem("from_loginpage", "yes");
          self.orderStatus();
          self.cartdetails();
      }
  };

  this.getMenus = function() {
    data = {};
    $http({
      method: 'POST',
      url: etmRestaurant.url + 'getMenus',
      headers: HEADERS
    })
    .success(function(data)
    {
      console.log(data);
      window.localStorage.setItem('cat_last_modified', data['cat_last_modified']);

      $cordovaSQLite.execute(etmDB, 'INSERT INTO localDB(localkey,localvalue) VALUES (?,?)', ['menus', JSON.stringify(data)]);

      cats = cat_subs(data['menus']);

      for (i in cats) {
          category = cats[i];
          for (k in category['products']) {
              product_id = category['products'][k];
              $cordovaSQLite.execute(etmDB, 'INSERT INTO menutoproductsDB (category_id ,product_id) VALUES (?,?)', [category['category_id'], product_id]);
          }
      }

      self.getProducts();

      etmRestaurant.pbar_count++;
    })
    .error(function(error)
    {
      $interval.cancel(etmRestaurant.localloding_IntervalID);
      alert("Network Connection Error!");
    });
  };

  this.getProducts = function() {
    $http({
      method: 'POST',
      url: etmRestaurant.url + 'getproductsIDs',
      headers: HEADERS
    })
    .success(function(data)
    {
      window.localStorage.setItem("prodUpdatedTime", new Date());
      window.localStorage.setItem("last_modified", data['last_modified']);
      etmRestaurant.products_IDs = data['proIDS'];
      etmRestaurant.per_count = etmRestaurant.per_count + data['proIDS'].length;
      etmRestaurant.pbar_total_count += data['proIDS'].length;

      etmRestaurant.page_num = 0;
      self.products_lS_recursive();
    })
    .error(function(error)
    {
      alert("Network Connection Failed!");
    });
  };

  this.products_lS_recursive = function() {

    var data = toparams({page: etmRestaurant.page_num});
    etmRestaurant.page_num++;

    $http({
      method: 'POST',
      url: etmRestaurant.url + 'getProducts',
      headers: HEADERS,
      data: data
    })
    .success(function(data)
    {
      console.log(JSON.stringify(data) + " num : " + etmRestaurant.page_num);
      try {
        if (data != "") {

            for (i in data) {
                json = data[i];
                $cordovaSQLite.execute(etmDB, 'INSERT INTO productsDB(product_id,product) VALUES (?,?)', [json['product_id'], data[i]]);
                etmRestaurant.pbar_count = etmRestaurant.pbar_count + 1;

            }

            self.products_lS_recursive();
        }
        else {
            etmRestaurant.localloding_complete = true;
            window.localStorage.removeItem("loading_start");
        }
      }
      catch (e) {
        etmRestaurant.error_continue_page = '#pageLoading';
        clearInterval(etmRestaurant.localloding_IntervalID);
      }
    })
    .error(function(error)
    {
      etmRestaurant.localloding_complete = true;
      window.localStorage.removeItem("loading_start");
    });
  };

  this.getstoreopened = function() {
    $http({
      method: 'POST',
      url: etmRestaurant.url + 'getstoreopened',
      headers: HEADERS
    })
    .success(function(data)
    {
      if(data['storeopened'] == 1)
      {
        etmRestaurant.store_status = 1;
      } else {
        etmRestaurant.store_status = 0;
      }
    })
    .error(function(error)
    {
      alert("Network Connection Error!");
    });
  };

  this.getOffers = function() {
    self.showLoading("Offer Loading...");
    data = {};
    if (window.localStorage.customer_id) {
        data = toparams({customer_id: window.localStorage.customer_id});
    }

    return $http({
      method : 'POST',
      url : etmRestaurant.url + 'getOffers',
      headers : HEADERS,
      data: data
    })
    .success(function(data)
    {
      window.sessionStorage.setItem("offer_checked", "checked");
      var html_offers = '';

      if (data != "") {
          for (i in data) {
              html_offers += '<div class="offerslist">' + data[i] + '</div>';
          }
          window.localStorage.setItem("offer_exist", 1);
      }
      else {
          html_offers = "<h2>No Offers Available</h2>";
          window.localStorage.setItem("offer_exist", 0);
      }

      window.localStorage.setItem("html_offers", html_offers);
      self.hideLoading();
      return html_offers;
    })
    .error(function(error)
    {
      self.hideLoading();
      return error;
    });
  };

  this.myAccount = function() {
    this.getCustomerAddresses();
    this.getcustomerdetails();
  };

  this.getCustomerAddresses = function() {
    data = toparams({customer_id: window.localStorage.customer_id});

    return $http({
      method : 'POST',
      url : etmRestaurant.url + 'getcustomeraddresses',
      headers : HEADERS,
      data: data
    })
    .success(function(data)
    {
      window.localStorage.setItem("customer_addresses_" + window.localStorage.customer_id, data);
    })
    .error(function(error)
    {
      alert("Network Connection Error!");
    });

  };

  this.getcustomerdetails = function() {
    data = toparams({customer_id: window.localStorage.customer_id});

    $http({
      method : 'POST',
      url: etmRestaurant.url + 'getcustomerdetails',
      headers : HEADERS,
      data: data
    })
    .success(function(res) {
        customer_details = res;
        window.localStorage.setItem("customerdetails_" + window.localStorage.customer_id, res);
        currentUserService.cust_fname = customer_details['firstname'];
        currentUserService.cust_lname = customer_details['lastname'];
        currentUserService.cust_email = customer_details['email'];
        currentUserService.cust_telephone = customer_details['telephone'];
        currentUserService.cust_address_id = customer_details['address_id'];
    })
    .error(function(error)
    {
      alert("Network Connection Error!");
    });

  };

  this.orderStatus = function() {

    status_html = '';
    if (window.localStorage.customer_id) {

            if (window.localStorage.getItem("confirmed_order_" + window.localStorage.customer_id)) {
                data = toparams({order_id: window.localStorage.getItem("confirmed_order_" + window.localStorage.customer_id)});

                $http({
                  method : 'POST',
                  url: etmRestaurant.url + 'getorderstatuses',
                  headers : HEADERS,
                  data: data
                })
                .success(function(res) {
                  try {
                      order_stat = res;
                      if (order_stat['order_statuses']) {
                          status_html += '<table data-role="table" data-mode="columntoggle" class="ui-responsive table-stroke place_orderstatus"><tbody>';
                          status_html += '<tr class="status_heading"><th colspan="2">Order ID : #' + window.localStorage.getItem("confirmed_order_" + window.localStorage.customer_id) + '</th><tr>';
                          status_html += '<tr class="status_heading"><th>Time</th><th>Status</th></tr>';
                          for (i in order_stat['order_statuses']) {
                              status_html += '<tr><td><strong>' + order_stat['order_statuses'][i].date_added + '</strong></td><td><strong>' + order_stat['order_statuses'][i].status + '</strong></td></tr>';
                              if (order_stat['order_statuses'][i].status == 'Complete') {
                                  angular.element(document.querySelector(".orderstat")).html('');
                              }
                              else {
                                  angular.element(document.querySelector(".orderstat")).html('*');
                              }
                          }
                          if (order_stat['order_statuses'][i].comment) {
                              cmt = order_stat['order_statuses'][i].comment;
                              cmt = cmt.replace(/(\r\n|\n\r|\r|\n)/g, "<br>");
                              status_html += '<tr><td colspan="2">' + cmt + '</td></tr>';
                          }
                          status_html += '</tbody ></table>';
                          angular.element(document.querySelector('#orderstatus')).html(status_html);
                          angular.element(document.querySelector('#orderstatus')).trigger('create');
                          angular.element(document.querySelector('#orderstatus')).attr('orderid', window.localStorage.getItem("confirmed_order_" + window.localStorage.customer_id));
                          angular.element(document.querySelector('#orderstatus')).attr('ord_stat', order_stat['order_statuses'][i].status);
                      }
                      else {
                          status_html += '<label>No Orders</label>';
                          angular.element(document.querySelector('#orderstatus')).html(status_html);
                      }
                  }
                  catch (e) {
                      etmRestaurant.error_continue_page = '#pageHome';
                      //catch_errors(e, "Error - 122");
                  }
                })
                .error(function(error)
                {
                  etmRestaurant.error_continue_page = '#pageHome';
                  //connection_errors("Error -  C 122");
                  alert("Network Connection Error!");
                });
            }
            else {
                angular.element(document.querySelector('#orderstatus')).html("No Recent Orders");
            }

            if (window.sessionStorage.orderstats) {
                window.sessionStorage.removeItem("orderstats");
                $.mobile.changePage("#pageOrderStatus");
            }
    }
    else {
        window.sessionStorage.setItem("from_orderstat", "yes");
        window.sessionStorage.removeItem("from_settings");
        window.sessionStorage.removeItem("from_orderhistory");
        window.sessionStorage.removeItem("from_reward");
        window.sessionStorage.removeItem("from_edit");
        window.sessionStorage.removeItem("from_changepasswaord");
        window.sessionStorage.removeItem("from_editaddress");
        $scope.go('signin');
    }

  };

  this.cartdetails = function() {

    if ($ionicHistory.currentView().stateName != 'flashscreen') {
        //self.showLoading("Cart Detail Loading...");
    }

    if (window.localStorage.customer_id) {
        if (window.sessionStorage.default_address_id) {

        }
        else {
            window.sessionStorage.setItem("default_address_id", window.localStorage.address_id);
        }
        /*
        if ($(this).attr('smartdeal_id')) {
            data = {customer_id: localStorage.customer_id, address_id: sessionStorage.default_address_id, suggested_dealid: $(this).attr('smartdeal_id')};
        }
        else {
            data = {customer_id: localStorage.customer_id, address_id: sessionStorage.default_address_id, products: JSON.stringify(etmRestaurant.cart)};
        }
        if (sessionStorage.delete_item_key) {
            data.remove = sessionStorage.delete_item_key;
        }
        if ($(this).attr('plus_qty_key')) {
            data.update = $(this).attr('plus_qty_key');
            data.quantity = $(this).attr('plus_qty');
        }
        if ($(this).attr('minus_qty_key')) {
            data.update = $(this).attr('minus_qty_key');
            data.quantity = $(this).attr('minus_qty');
        }
        if (sessionStorage.del_prod_key) {
            data.remove = sessionStorage.del_prod_key;
            sessionStorage.removeItem("del_prod_key");
            if (sessionStorage.delete_keys_array) {
                sessionStorage.removeItem("delete_keys_array");
                data.remove = etmRestaurant.delete_keys_arr;
            }
        }
        if ($.trim($('#txt_coupon').val()).length > 0) {
            sessionStorage.setItem("coupon", $('#txt_coupon').val());
            data.coupon = sessionStorage.coupon;
            sessionStorage.removeItem("validcoupon");
        }
        if ($.trim($('#txt_reward').val()).length > 0) {
            sessionStorage.setItem("reward", $('#txt_reward').val());
            data.reward = sessionStorage.reward;
            sessionStorage.removeItem("validreward");
        }
        if ($.trim($('#txt_voucher').val()).length > 0) {
            sessionStorage.setItem("voucher", $('#txt_voucher').val());
            data.voucher = sessionStorage.voucher;
            sessionStorage.removeItem("validvoucher");
        }
        if (sessionStorage.validcoupon) {
            data.coupon = sessionStorage.validcoupon;
        }
        if (sessionStorage.validreward) {
            data.reward = sessionStorage.validreward;
        }
        if (sessionStorage.validvoucher) {
            data.voucher = sessionStorage.validvoucher;
        }
        if (isOnlineConnection()) {
            $.post(etmRestaurant.url + 'cartdetails',
                    data,
                    function(response) {
                        try {
                            etmRestaurant.cart = [];
                            etmRestaurant.added_items = [];
                            etmRestaurant.delete_keys_arr = [];
                            etmRestaurant.temp_itemcount = 0;
                            json = JSON.parse(response);
                            $.mobile.loading("hide");
                            displayCartdetails(json);
                        }
                        catch (e) {
                            etmRestaurant.error_continue_page = cartdetails;
                            catch_errors(e, "Error - 110");
                        }
                    }).fail(function(error) {
                etmRestaurant.error_continue_page = cartdetails;
                connection_errors("Error -  C 110");
            });
        }
        else {
            if (etmRestaurant.frontOffers_page == 1) {
                etmRestaurant.frontOffers_page = 0;
                $.mobile.changePage("#pageOffersFront");
            }
            else {
                etmRestaurant.error_continue_page = cartdetails;
                connection_errors("Error -  C1 110");
            }
        }
        */
    }
    else {
        self.hideLoading();
        $scope.go('signin');
    }
  };

});

app.service('signinService', function($http, currentUserService, etmRestaurant, HEADERS, $ionicLoading) {


  this.login = function(email, password) {
    var data = toparams({
      email : email,
      password : password
    });

    return $http({
      method: 'POST',
      url: etmRestaurant.url + 'login',
      headers: HEADERS,
      data: data
    });
  };

});

app.service('homeScreenService', function($http, $interval, $cordovaSQLite, currentUserService, etmRestaurant, HEADERS, $ionicLoading, $q) {
    var self = this;
    self.menu1 = [];

    self.getCategories = function() {

      etmRestaurant.menuthemelevel = 1;

      if (etmRestaurant.localloding_IntervalID) {
          $interval.cancel(etmRestaurant.localloding_IntervalID);
      }


    var query = "SELECT localkey,localvalue FROM localDB WHERE localkey='menus'";

    var result = $cordovaSQLite.execute(etmDB, query).then(function(res) {
        menu = angular.fromJson(res.rows.item(0).localvalue);
        self.menu1 = menu['menus'];
        console.log(self.menu1);
        return menu['menus'];
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
            return data["menus"];
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
          return [];
        });

    });

    console.log(self.menu1);
     return self.menu1;
  };
});

function menus_html(categories) {

}
