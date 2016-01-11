angular.module('mmr.controllers')

.controller('CategoryCtrl', ['$scope', '$rootScope', '$timeout', '$ionicScrollDelegate', 'localStorageService', 'mmrEventing', 'mmrItemFactory',
  function($scope, $rootScope, $timeout, $ionicScrollDelegate, localStorageService, mmrEventing, mmrItemFactory) {

  // controller defaults
  $scope.sortActivated = false;
  $scope.selectedSortIndex = 0;
  $scope.sorters = [
    { 'text': '智能排序' },
    { 'text': '价格从高到低' },
    { 'text': '价格从低到高' },
    { 'text': '销量从高到低' },
    { 'text': '销量从低到高' }
  ];

  $scope.screenActivated = false;

  // menu related
  $scope.currentLevel = 0;
  $scope.menuOpened = false;
  $scope.menuHeight = 0;

  // scroll related
  $scope.showBacktoTopBtn = false;

  // search related
  $scope.searchResults = [];

  // record which brand and attribute has been selected
  var selectedBrandsIdx = {},
      selectedAttributesIdx = {};

  // init
  init();

  // methods
  $scope.activateSort = function() {
    $scope.screenActivated = false;
    $scope.sortActivated = !$scope.sortActivated;

    // close menu
    $scope.swipeMenu(false);
  };

  $scope.doSelectSorter = function(idx) {
    $scope.selectedSortIndex = idx;
    $scope.sortActivated = false;
  };

  $scope.activateScreen = function() {
    $scope.sortActivated = false;
    $scope.screenActivated = !$scope.screenActivated;

    // close menu
    $scope.swipeMenu(false);

    // hide the bottom tabs
    $rootScope.$root.ui.tabsHidden = !$rootScope.$root.ui.tabsHidden;
  };

  $scope.doSelectBrand = function(idx) {
    toggleStatus(selectedBrandsIdx, idx);


  };

  $scope.doSelectAttribute = function(idx) {
    toggleStatus(selectedAttributesIdx, idx);
  };

  $scope.checkStatus = function(type, idx) {
    if(type === 'brand') {
      return !!selectedBrandsIdx[idx];
    } else {
      return !!selectedAttributesIdx[idx];
    }
  };

  $scope.doResetScreen = function() {
    selectedBrandsIdx = {};
    selectedAttributesIdx = {};
  };

  $scope.doConfirmScreen = function() {
    // confirm logic

    // hide the screen popup
    $scope.activateScreen();
  };

  $scope.swipeMenu = function(open) {
    $scope.menuOpened = open;
  };

  $scope.doTapBackdrop = function() {
    // reset all
    $scope.sortActivated = false;
    $scope.swipeMenu(false);
  };

  // scroll related
  $scope.getScrollPosition = function() {
    var moveData = $ionicScrollDelegate.getScrollPosition().top;
    $scope.$apply(function(){
      if(moveData > 150){
        $scope.showBacktoTopBtn=true;
      }else{
        $scope.showBacktoTopBtn=false;
      }
    }); //apply
  };

  $scope.scrollToTop = function() {
    $ionicScrollDelegate.scrollTop(true);
    $scope.showBacktoTopBtn = false;
  };

  // search related
  $scope.doSelectCategory = function(item) {
    console.log(item);

    // close menu
    $timeout(function() {
      $scope.swipeMenu(false);
    }, 500);
  };

  // cache bindings
  localStorageService.bind($scope, 'brands');
  localStorageService.bind($scope, 'attributes');
  localStorageService.bind($scope, 'classifications');

  // event handlers

  // private functions
  function toggleStatus(mapping, idx) {
    if(mapping[idx]) {
      delete mapping[idx];
    } else {
      mapping[idx] = true;
    }
  }

  function init() {
    mmrItemFactory.search().then(function(res) {
      $scope.searchResults = res.data;

      // adjust the height of the menubar
      // $scope.menuHeight = document.querySelector('.m-search-list').clientHeight;
    }, function(err) {

    });
  }
}])

.controller('CategoryMenuCtrl', ['$scope', function($scope) {

}]);