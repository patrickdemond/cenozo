define( [], function() {

  'use strict';
  var cenozo = angular.module( 'cenozo' );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnLanguageAdd', function () {
    return {
      templateUrl: 'app/language/add.tpl.html',
      restrict: 'E'
    };
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnLanguageView', function () {
    return {
      templateUrl: 'app/language/view.tpl.html',
      restrict: 'E'
    };
  } );

} );
