angular.module('mmr.services')

.factory('mmrEventing', ['$rootScope', function($rootScope) {

  return {

    doOpenLogin: function(data) {
      $rootScope.$broadcast('eventOpenLogin', data);
    },

    doOpenPersonalInfo: function(data) {
      $rootScope.$broadcast('eventOpenPersonalInfo', data);
    },

    doOpenMyDeposit: function(data) {
      $rootScope.$broadcast('eventOpenMyDeposit', data);
    },

    doOpenRegister: function(data) {
      $rootScope.$broadcast('eventOpenRegister', data);
    },

    // inside category view
    doOpenFilters: function(data) {
      $rootScope.$broadcast("eventOpenFilters", data);
    }

  };

}]);