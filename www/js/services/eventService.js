angular.module('mmr.services')

.factory('mmrEventing', ['$rootScope', function($rootScope) {

  return {

    doOpenConfig: function(data) {
      $rootScope.$broadcast('eventOpenConfig', data);
    },

    doBackMine: function(data) {
      $rootScope.$broadcast('eventBackMine', data);
    },

    doOpenLogin: function(data) {
      $rootScope.$root.states.beforeLogin = data;
      $rootScope.$broadcast('eventOpenLogin', data);
    },

    doOpenPersonalInfo: function(data) {
      $rootScope.$broadcast('eventOpenPersonalInfo', data);
    },

    doOpenMyDeposit: function(data) {
      $rootScope.$broadcast('eventOpenMyDeposit', data);
    },

    doOpenMyCoupon: function(data) {
      $rootScope.$broadcast('eventOpenMyCoupon', data);
    },

    doOpenMyReceipt: function(data) {
      $rootScope.$broadcast('eventOpenMyReceipt', data);
    },

    doOpenRegister: function(data) {
      $rootScope.$broadcast('eventOpenRegister', data);
    },

    doOpenMyAddressMgmt: function(data) {
      $rootScope.$broadcast('eventOpenAddressMgmt', data);
    },

    doOpenMoreOrders: function(data) {
      $rootScope.$broadcast('eventOpenMoreOrders', data);
    },

    doOpenMyCollect: function(data) {
      $rootScope.$broadcast('eventOpenMyCollect', data);
    },

    // inside category view
    doOpenFilters: function(data) {
      $rootScope.$broadcast('eventOpenFilters', data);
    },

    // order operations below
    doOpenOrderDetail: function(data) {
      $rootScope.$broadcast('eventOpenOrderDetail', data);
    },

    doApplyService: function(data) {
      $rootScope.$broadcast('eventApplyService', data);
    },

    doPayOrder: function(data) {
      $rootScope.$broadcast('eventPayOrder', data);
    },

    doBuyAgain: function(data) {
      $rootScope.$broadcast('eventBuyAgain', data);
    },

    doCheckSelfCode: function(data) {
      $rootScope.$broadcast('eventCheckSelfCode', data);
    },

    doCheckServiceDetail: function(data) {
      $rootScope.$broadcast('eventCheckServiceDetail', data);
    },

    doConfirmOrder: function(data) {
      $rootScope.$broadcast('eventConfirmOrder', data);
    },
    // order operations end

    // sorters and screeners
    doSelectSorter: function(eventName, data) {
      $rootScope.$broadcast(eventName, data);
    },

    doBroadcastScreenEvent: function(eventName, data) {
      $rootScope.$broadcast(eventName, data);
    },

    doHideBackdrop: function() {
      $rootScope.$broadcast('eventHideBackdrop');
    },

    // item minus/plus from/to cart
    doIncreaseItemCount: function(scope, data) {
      scope.$emit('doIncreaseItemCount', data);
    },

    doDecreaseItemCount: function(scope, data) {
      scope.$emit('doDecreaseItemCount', data);
    },

    doSetItemCount: function(scope, data) {
      scope.$emit('doSetItemCount', data);
    },

    doAddItemToCart: function(scope, data) {
      scope.$emit('doAddItemToCart', data);
    },

    // state transfers
    // this will trigger the state to cart
    doStateToCart: function(data) {
      $rootScope.$broadcast('doStateToCart', data);
    },

    // when the state arrives cart
    doStateArriveCart: function(data) {
      $rootScope.$broadcast('doStateArriveCart', data);
    },

    // address related
    doChangeAddress: function(data) {
      $rootScope.$broadcast('doChangeAddress', data);
    },

    // select position
    doSelectPos: function(data) {
      $rootScope.$broadcast('doSelectPos', data);
    },

    // select search history keyword
    doSelectSearchHistory: function(data) {
      $rootScope.$broadcast('doSelectSearchHistory', data);
    },

    // select category item
    doSelectCategoryMenu: function(data) {
      $rootScope.$broadcast('doSelectCategoryMenu', data);
    },

    // category related
    doSetCategoryItems: function(level, shouldPush) {
      if(shouldPush === undefined) {
        shouldPush = true;
      }

      $rootScope.$broadcast('doSetCategoryItems', {
        level: level,
        shouldPush: shouldPush
      });
    },

    doCategoryItemsBack: function() {
      $rootScope.$broadcast('doCategoryItemsBack');
    },

    doCategoryBackToTop: function() {
      $rootScope.$broadcast('doCategoryBackToTop');
    },

    doRefreshCategoryMenu: function() {
      $rootScope.$broadcast('doRefreshCategoryMenu');
    },

    doOpenMyFootprint: function() {
      $rootScope.$broadcast('eventOpenMyFootprint');
    },

    doCancelPayment: function(data) {
      $rootScope.$broadcast('doCancelPayment', data);
    },

    doNewOrderGenerated: function(data) {
      $rootScope.$broadcast('doNewOrderGenerated', data);
    },

    doLoginSuccessfully: function() {
      $rootScope.$broadcast('doLoginSuccessfully');
    },

    doRegisterSuccessfully: function() {
      $rootScope.$broadcast('doRegisterSuccessfully');
    },

    doLogout: function() {
      $rootScope.$broadcast('doLogout');
    },

    doBuyImmediately: function(data) {
      $rootScope.$broadcast('doBuyImmediately', data);
    },

    doCancelBuyImmediately: function(data) {
      $rootScope.$broadcast('doCancelBuyImmediately', data);
    },

    doLoadHomeCommodity: function(data) {
      $rootScope.$broadcast('doLoadHomeCommodity', data);
    },

    doUseNewlyCreatedAddress: function(data) {
      $rootScope.$broadcast('doUseNewlyCreatedAddress', data);
    },

    doSelectSelfPickAddress: function(data) {
      $rootScope.$broadcast('doSelectSelfPickAddress', data);
    },

    doToggleReceiptAddress: function(data) {
      $rootScope.$broadcast('doToggleReceiptAddress', data);
    },

    doToggleQuarantineAddress: function(data) {
      $rootScope.$broadcast('doToggleQuarantineAddress', data);
    },

    doChangeReceipt: function(data) {
      $rootScope.$broadcast('doChangeReceipt', data);
    },

    doPaySuccessfully: function(data) {
      $rootScope.$broadcast('doPaySuccessfully', data);
    },

    // mp common related
    doMenuClicked: function(data) {
      $rootScope.$broadcast('doMenuClicked', data);
    }

  };

}]);
