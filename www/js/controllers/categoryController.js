angular.module('mmr.controllers')

.controller('CategoryCtrl', ['$scope', '$rootScope', '$timeout', '$stateParams', '$ionicScrollDelegate', 'localStorageService', 'mmrDataService', 'mmrEventing', 'mmrItemFactory', 'mmrCacheFactory', 'mmrScrollService',
  function($scope, $rootScope, $timeout, $stateParams, $ionicScrollDelegate, localStorageService, mmrDataService, mmrEventing, mmrItemFactory, mmrCacheFactory, mmrScrollService) {

  $timeout(function() {
    var cid = $stateParams.cid;
    if(cid) {
      $scope.searchObject.cid = cid;
      $scope.doSearch(2);
    } else {
      // $scope.initialize();
    }
  }, 100);

  // sort related
  $scope.sortEventName = 'eventCategorySort';
  $scope.sortActivated = false;
  $scope.sortMethod = 0;

  // screen related
  $scope.screenEventPrefix = 'eventCategoryScreen';
  $scope.screenActivated = false;

  // menu related
  $scope.currentLevel = '';
  $scope.menuOpened = false;
  $scope.menuHeight = 0;

  // options bar related
  $scope.optionsBarOpened = true;

  // scroll related
  $scope.showBacktoTopBtn = false;

  // search related
  $scope.searchNoResult = false;
  $scope.searchResults = [];
  $scope.searchInputFocused = false;
  $scope.searchObject = {
    keyword: '',
    cid: undefined,
    page: 0
  };

  // empty content related
  $scope.ec = {};
  $scope.ec.words = ['没有搜索到相关商品...'];
  $scope.ec.additionalClass = 'm-cat-empty';

  // methods
  $scope.initialize = function() {
    mmrDataService.request(mmrItemFactory.search({
      page: $scope.searchObject.page
    })).then(function(res) {
      if(res[0] !== 'null' && res[0] instanceof Array) {
        $scope.searchResults = res[0];
        $scope.searchObject.page += 1;
        $scope.searchNoResult = false;
        $scope.initReady = true;
      } else {
        $scope.searchNoResult = true;
      }
    }, function(err) {

    });
  };

  $scope.activateSort = function() {
    $scope.screenActivated = false;
    $scope.sortActivated = !$scope.sortActivated;

    // close menu
    $scope.swipeMenu(false);
  };

  $scope.activateScreen = function() {
    $scope.sortActivated = false;
    $scope.screenActivated = !$scope.screenActivated;

    // close menu
    $scope.swipeMenu(false);

    // hide the bottom tabs
    $timeout(function() {
      $rootScope.$root.ui.tabsHidden = $scope.screenActivated;
    }, 300);
  };

  $scope.swipeMenu = function(open) {
    // make sure the menu items will be rendered when open the menu
    $timeout(function() {
      if(open) {
        mmrEventing.doRefreshCategoryMenu();
      }

      $scope.menuOpened = open;

      // control the tab
      if(open) {
        $rootScope.$root.ui.tabsHidden = true;
      } else {
        $rootScope.$root.ui.tabsHidden = false;
      }
    }, 200);
  };

  $scope.doTapBackdrop = function() {
    // reset all
    $scope.sortActivated = false;
    $scope.swipeMenu(false);
  };

  // inifinite scroll related
  $scope.moreDataCanBeLoaded = function() {
    if(!$scope.searchNoResult) {
      return true;
    }

    return false;
  };

  $scope.loadMore = function() {
    $scope.isLoadingMore = true;

    mmrDataService.request(mmrItemFactory.search(assembleSearchVo())).then(function(res) {
      if(res[0] !== 'null' && res[0] instanceof Array) {
        $scope.searchResults = $scope.searchResults.concat(res[0]);
        $scope.searchObject.page += 1;
        $scope.searchNoResult = false;
      } else {
        $scope.searchNoResult = true;
      }
      $scope.isLoadingMore = false;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }, function(err) {

    });
  };

  // scroll related
  var lastTops = [];
  $scope.onScroll = function() {
    var threshold = 150;
    mmrScrollService.onScroll({
      handler: 'searchScroll',
      onDowning: function() {
        $rootScope.$root.ui.tabsHidden = false;
        $scope.optionsBarOpened = false;
      },
      onUping: function() {
        $rootScope.$root.ui.tabsHidden = false;
        $scope.optionsBarOpened = true;
      },
      onNegative: function() {
        $rootScope.$root.ui.tabsHidden = false;
        $scope.optionsBarOpened = true;
      },
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
    });

    // hide the menu if opened
    if($scope.menuOpened) {
      $scope.menuOpened = false;
    }
  };

  $scope.scrollToTop = function() {
    $ionicScrollDelegate.scrollTop(true);
    $scope.showBacktoTopBtn = false;
  };

  $scope.doFocusSearchInput = function() {
    $scope.searchInputFocused = true;
    $rootScope.$root.ui.tabsHidden = true;

    // hide the sort/screen
    $scope.sortActivated = false;
    $scope.screenActivated = false;
  };

  $scope.doBlurSearchInput = function($event) {
    $scope.searchInputFocused = false;
    $rootScope.$root.ui.tabsHidden = false;
  };

  $scope.doSubmitSearchRequest = function(keyword) {
    mmrEventing.doSelectSearchHistory({
      text: keyword
    });
  };

  // search type:
  // 1: direct search by input keyword in the corresponding control
  // 2: click the category menu
  // 3: triggered by the screener
  $scope.doSearch = function(type) {
    // reset
    $scope.searchObject.type = type;
    $scope.searchObject.page = 0;
    $scope.sortMethod = 0;
    $scope.searchResults = [];
    $scope.isLoadingMore = false;

    mmrDataService.request(mmrItemFactory.search(assembleSearchVo())).then(function(res) {
      if(res[0] !== 'null' && res[0] instanceof Array) {
        $scope.searchResults = res[0];
        $scope.searchObject.page += 1;

        if(res[0].length < ($scope.searchObject.size || 10)) {
          $scope.searchNoResult = true;
        } else {
          $scope.searchNoResult = false;
        }
      } else {
        $scope.searchNoResult = true;
      }

      // scroll to the top
      // $scope.scrollToTop();
    }, function(err) {

    });

    if((angular.isUndefined(type) || type === 1) &&
        _.trim($scope.searchObject.keyword) !== '') {
      // update the search history
      var keywords = $rootScope.$root.search.keywords,
          keyword = $scope.searchObject.keyword;
      // try to find the existing if any
      var existed = _.find(keywords, { text: keyword });
      if(existed) {
        // update the time
        existed.time = new Date();

        // sort the keywords by time
        keywords = _.sortBy(keywords, function(o) {
          return -o.time.getTime();
        });
      } else {
        // try to add new one into queue
        keywords.unshift({
          text: keyword,
          detail: '',
          time: new Date()
        });

        if(keywords.length > 15) {
          keywords.pop();
        }
      }
    }

    // hide the keyboard
    $timeout(function() {
      try {
        if(cordova && cordova.plugins && cordova.plugins.Keyboard) {
          $timeout(function() {
            cordova.plugins.Keyboard.close();
          }, 100);
        }
      } catch (e) {
        if (e instanceof ReferenceError) {
          // take necessary steps
        }
      }
    }, 50);
  };

  // cache bindings
  $scope.tags = [
    { title: '品牌', items: mmrCacheFactory.get('brands'), exclusively: false, selected: {} },
    { title: '产品属性', items: mmrCacheFactory.get('attributes'), exclusively: true, selected: {} }
  ];

  localStorageService.bind($scope, 'classifications');
  // localStorageService.bind($scope, 'hotKeywords');

  // watchers

  // event handlers
  $scope.$on($scope.sortEventName, function($event, data) {
    // after selecting the new sorting method
    $scope.sortMethod = data;
    $scope.searchResults = mmrDataService.sortItems($scope.searchResults, $scope.sortMethod);
  });

  $scope.$on($scope.screenEventPrefix + 'SelectItem', function($event, data) {

  });

  $scope.$on($scope.screenEventPrefix + 'Reset', function($event, data) {
    // make all selected flag to false
    _.forEach($scope.tags, function(tag) {
      tag.selected = {};
      _.forEach(tag.items, function(item) {
        item.selected = false;
      });
    });

    screenerCount = 0;
    $scope.searchObject.bid = undefined;
    $scope.searchObject.aid = undefined;
  });

  $scope.$on($scope.screenEventPrefix + 'Confirm', function($event, data) {
    // confirm logic
    var assembledBid = assembleTags($scope.tags[0].selected, false),
        assembledAid = assembleTags($scope.tags[1].selected, true);

    var toTriggerSearch = false;
    if($scope.searchObject.bid !== assembledBid) {
      $scope.searchObject.bid = assembledBid;
      toTriggerSearch = true;
    }
    if($scope.searchObject.aid !== assembledAid) {
      $scope.searchObject.aid = assembledAid;
      toTriggerSearch = true;
    }

    // hide the screen popup
    $scope.activateScreen();

    // trigger the search
    if(toTriggerSearch) {
      $scope.doSearch(3);
    }
  });

  // handler on history keyword click
  $scope.$on('doSelectSearchHistory', function($event, data) {
    $scope.searchObject.keyword = data.text;
    $scope.doSearch(1);
    $scope.doBlurSearchInput();
  });

  $scope.$on('doSelectCategoryMenu', function($event, data) {
    $scope.searchObject.cid = data.id;
    $scope.doSearch(2);
    $scope.doBlurSearchInput();
  });

  $scope.$on('doCategoryBackToTop', function($event, data) {
    $scope.searchObject.cid = undefined;
    $scope.doSearch(2);
  });

  // private functions
  var screenerCount = 0;
  function assembleTags(tags, exclusively) {
    var assembled = '';
    _.forEach(tags, function(selected, key) {
      if(selected) {
        assembled += key;

        if(!exclusively) {
          assembled += ',';
          screenerCount += 1;
        } else {
          // return prematurely
          return false;
        }
      }
    });

    return assembled;
  }

  // assemble the search value object
  function assembleSearchVo() {
    var searchVo = {};

    if(_.trim($scope.searchObject.keyword) !== '') {
      searchVo.keyword = $scope.searchObject.keyword;
    }
    if($scope.searchObject.cid !== 0) {
      searchVo.cid = $scope.searchObject.cid;
    }
    searchVo.aid = $scope.searchObject.aid;
    searchVo.bid = $scope.searchObject.bid;
    searchVo.page = $scope.searchObject.page;
    searchVo.sort = $scope.sortMethod;

    return searchVo;
  }
}])

.controller('CategoryMenuCtrl', ['$scope', function($scope) {

}]);
