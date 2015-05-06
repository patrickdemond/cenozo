define( [], function() {

  'use strict';

  /* ######################################################################################################## */
  cnCachedProviders.controller( 'UserAddCtrl', [
    '$scope', 'CnUserModelFactory',
    function( $scope, CnUserModelFactory ) {
      $scope.model = CnUserModelFactory.root;
      $scope.record = $scope.model.cnAdd.onNew();
    }
  ] );

  /* ######################################################################################################## */
  cnCachedProviders.controller( 'UserListCtrl', [
    '$scope', 'CnUserModelFactory',
    function( $scope, CnUserModelFactory ) {
      $scope.model = CnUserModelFactory.root;
      $scope.model.cnList.onList().catch( function exception() { cnFatalError(); } );
    }
  ] );

  /* ######################################################################################################## */
  cnCachedProviders.controller( 'UserViewCtrl', [
    '$scope', 'CnUserModelFactory',
    function( $scope, CnUserModelFactory ) {
      $scope.model = CnUserModelFactory.root;
      $scope.model.cnView.onView().catch( function exception() { cnFatalError(); } );
    }
  ] );

} );
