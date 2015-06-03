define( [], function() {

  'use strict';

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnAlternateAdd', function () {
    return {
      templateUrl: 'app/alternate/add.tpl.html',
      restrict: 'E'
    };
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnAlternateView', function () {
    return {
      templateUrl: 'app/alternate/view.tpl.html',
      restrict: 'E'
    };
  } );

} );