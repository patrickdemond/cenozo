define( [], function() {

  'use strict';
  var cenozo = angular.module( 'cenozo' );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnApplicationAdd', function () {
    return {
      templateUrl: 'app/application/add.tpl.html',
      restrict: 'E'
    };
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnApplicationView', function () {
    return {
      templateUrl: 'app/application/view.tpl.html',
      restrict: 'E'
    };
  } );

} );
