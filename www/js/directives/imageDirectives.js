angular.module('mmr.directives')

.directive('bannerPreload', ['$rootScope', function($rootScope) {
    return {
      restrict: 'A',
      scope: {
        ngSrc: '@'
      },
      link: function(scope, element, attrs) {

        element.on('load', function() {
          $rootScope.bannerLoading = false;
          element.addClass('in');
          $rootScope.$apply();
        }).on('error', function() {
          $rootScope.bannerLoading = false;
        });

        scope.$watch('ngSrc', function(newVal) {
          $rootScope.bannerLoading = true;
          element.removeClass('in');
        });
      }
    };
}])

.directive('salesArea', ['mmrModal', function(mmrModal) {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      areas: '='
    },
    templateUrl: 'templates/directives/sales-area.html',
    link: function(scope, element, attrs) {
      scope.doOpenPage = function(idx) {
        if (scope.preferredBrandModal && !scope.preferredBrandModal.scope.$$destroyed) {
          scope.preferredBrandModal.index = idx;
          scope.preferredBrandModal.show();
        } else {
          mmrModal.createPreferredBrandModal(scope, idx);
        }

      };
    }
  };

}]);
