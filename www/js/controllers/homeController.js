angular.module('mmr.controllers')

.controller('HomeCtrl', ['$scope', '$rootScope', '$q', '$timeout', '$ionicHistory', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', 'mmrAreaFactory', 'mmrItemFactory', 'mmrCommonService', 'mmrLoadingFactory', 'mmrDataService', 'mmrCacheFactory', '$ionicPopup', 'mmrMetaFactory',
  function($scope, $rootScope, $q, $timeout, $ionicHistory, $ionicScrollDelegate, $ionicSlideBoxDelegate, mmrAreaFactory, mmrItemFactory, mmrCommonService, mmrLoadingFactory, mmrDataService, mmrCacheFactory, $ionicPopup, mmrMetaFactory) {

  $scope.initialize = function() {
    // load data
    if($rootScope.$root.category.entries.length > 0) {
      mmrDataService.request(
        mmrAreaFactory.banners(),
        mmrAreaFactory.areas(),
        mmrItemFactory.seckilling2(),
        mmrItemFactory.homeCommodity2()
      ).then(function(res) {
        $scope.banners = res[0];
        $scope.areas = res[1];
        $scope.seckilling = res[2];
        $scope.commodities = res[3];
        $scope.positions = mmrCacheFactory.get('cities');

        // in case the network is restored
        $timeout(function() {
          $ionicSlideBoxDelegate.$getByHandle('bannersSlideBox').update();
        }, 1000);
      }, function(err) {
        console.log(err);
      }).finally(function() {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
    } else {
      mmrDataService.request(
        mmrAreaFactory.banners(),
        mmrAreaFactory.areas(),
        mmrItemFactory.seckilling2()
      ).then(function(res) {
        $scope.banners = res[0];
        $scope.areas = res[1];
        $scope.seckilling = res[2];
        $scope.positions = mmrCacheFactory.get('cities');

        // in case the network is restored
        $timeout(function() {
          $ionicSlideBoxDelegate.$getByHandle('bannersSlideBox').update();
        }, 1000);
      }, function(err) {
        console.log(err);
      }).finally(function() {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

  };

  $timeout(function(){
    return false; // <--- comment this to "fix" the problem
    var sv = $ionicScrollDelegate.$getByHandle('seckilling-horizontal').getScrollView();

    var container = sv.__container;

    var originaltouchStart = sv.touchStart;
    var originalmouseDown = sv.mouseDown;
    var originaltouchMove = sv.touchMove;
    var originalmouseMove = sv.mouseMove;

    container.removeEventListener('touchstart', sv.touchStart);
    container.removeEventListener('mousedown', sv.mouseDown);
    document.removeEventListener('touchmove', sv.touchMove);
    document.removeEventListener('mousemove', sv.mousemove);


    sv.touchStart = function(e) {
      e.preventDefault = function(){};
      originaltouchStart.apply(sv, [e]);
    };

    sv.touchMove = function(e) {
      e.preventDefault = function(){};
      originaltouchMove.apply(sv, [e]);
    };

    sv.mouseDown = function(e) {
      e.preventDefault = function(){};
      originalmouseDown.apply(sv, [e]);
    };

    sv.mouseMove = function(e) {
      e.preventDefault = function(){};
      originalmouseMove.apply(sv, [e]);
    };

    container.addEventListener("touchstart", sv.touchStart, false);
    container.addEventListener("mousedown", sv.mouseDown, false);
    document.addEventListener("touchmove", sv.touchMove, false);
    document.addEventListener("mousemove", sv.mouseMove, false);
  });

  $scope.initialize();

  $scope.openGeoPopover = function() {

    $scope.selectPos = true;
    $rootScope.$root.ui.tabsHidden = true;
  };

  // position related
  $scope.currentCity = '上海市';
  $scope.gotoOrigin = false;

  // event handler
  $scope.$on('doSelectPos', function($event, data) {
    $scope.selectPos = false;
    $rootScope.$root.ui.tabsHidden = false;
    $scope.gotoOrigin = false;

    if (data.item !== '上海市' && data.item !== '南京市') {
      $scope.gotoOrigin = true;
      $scope.currentCity = '上海市';
      var gotoPopup =  $ionicPopup.show({
        scope: $scope,
        template: '<p class="m-popup-text">您所在的城市暂未开通服务</p><p class="m-popup-text">自动为您跳转到<span class="energized">上海市</span></p>'
      });
      gotoPopup.then(function() {
        $scope.initialize();
        $scope.gotoOrigin = false;
      });

      $timeout(function() {
        gotoPopup.close();
      }, 1000);
    }else {
      $scope.initialize();
      $scope.currentCity = data.item;
    }
  });

  $scope.$on('doLoadHomeCommodity', function($event, data) {
    mmrDataService.request(
      mmrItemFactory.homeCommodity2()
    ).then(function(res) {
      $scope.commodities = res[0];
    }, function(err) {
      console.log(err);
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  });

}]);
