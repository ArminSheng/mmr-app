angular.module('mmr.controllers')

.controller('OrderCtrl', ['$scope', '$rootScope', '$ionicScrollDelegate', '$state', '$stateParams', 'localStorageService', 'mmrScrollService', 'mmrOrderFactory', 'mmrCommonService',
  function($scope, $rootScope, $ionicScrollDelegate, $state, $stateParams, localStorageService, mmrScrollService, mmrOrderFactory, mmrCommonService) {

  $rootScope.$root.ui.tabsHidden = true;

  $scope.tab = Number($stateParams.orderType) || 0;

  // define tabs
  $scope.tabs = [
    { text: '全部' },
    { text: '待付款' },
    { text: '待发货' },
    { text: '待收货' },
    { text: '待自提' },
    { text: '售后中' }
  ];

  // current page
  $scope.currentPage = 0;

  $scope.switchTab = function(tab) {
    $scope.tab = tab;

    // reset page
    $scope.currentPage = 0;

    // recalculate the height
    $ionicScrollDelegate.$getByHandle('orderScroll').resize();

    // back to top
    $ionicScrollDelegate.scrollTop(true);

    $scope.initialize();
  };

  // scroll related
  $scope.onScroll = function() {
    var threshold = 150;
    var scrollStatus = mmrScrollService.onScroll(
      {
        handler: 'orderScroll',
        threshold: threshold,
        onThreshold: function(isGreaterThanThreshold) {
          $scope.$apply(function() {
            if(isGreaterThanThreshold) {
              $scope.showBacktoTopBtn = true;
            } else {
              $scope.showBacktoTopBtn = false;
            }
          });
        }
      }
    );

    $scope.$apply(function() {
      $scope.scrollStatus = scrollStatus;
    });
  };

  $scope.scrollToTop = function() {
    $ionicScrollDelegate.$getByHandle('orderScroll').scrollTop(true);
    $scope.showBacktoTopBtn = false;
  };

  $scope.initialize = function() {
    mmrOrderFactory.fetchOrderList({
      type: convertType($scope.tab),
      p: 0
    }).then(function(res) {
      $scope.orders = res;
      $scope.isEmpty = res.length === 0;
      $scope.currentPage += 1;
    }, function(err) {
      mmrCommonService.help('获取订单失败', '获取过程中发生了错误, 请稍后重试');
      $scope.isEmpty = true;
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.initialize();

  // infinite related
  $scope.infinitePredicate = function(size) {
    // TODO: default to use
    if(size % 10 > 0) {
      return false;
    } else {
      return true;
    }
  };

  $scope.infiniteHandler = function() {
    requestData();
  };

  // empty content related
  $scope.ec = {};
  $scope.ec.words = ['这里空空的，快去下单吧！'];
  $scope.ec.additionalClass = 'm-order-empty';
  $scope.ec.button = {
    text:'去逛逛',
    onTap: function() {
      $rootScope.$root.ui.tabsHidden = false;
      $state.go('tab.home');
    }
  };

  // -1全部0待付款1待发货2待收货3待自提4完成5关闭6售后7已派车8已出库21预定待确认22预定已确认41已收货待评价
  function convertType(tab) {
    switch(tab) {
      case 0:
        return -1;
      case 1:
        return 0;
      case 2:
        return 1;
      case 3:
        return 2;
      case 4:
        return 3;
      case 5:
        return 6;
    }
  }

  function requestData() {
    mmrOrderFactory.fetchOrderList({
      type: convertType($scope.tab),
      p: $scope.currentPage
    }).then(function(res) {
      if(res &&
         res instanceof Array &&
         res.length > 0) {
        $scope.orders = $scope.orders.concat(res);
        $scope.currentPage += 1;
      }
    }, function(err) {

    }).finally(function() {
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }

}]);
