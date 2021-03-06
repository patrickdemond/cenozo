define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'availability_type', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: { column: 'name' },
    name: {
      singular: 'availability type',
      plural: 'availability types',
      possessive: 'availability type\'s'
    },
    columnList: {
      name: { title: 'Name' },
      participant_count: {
        title: 'Participants',
        type: 'number'
      }
    },
    defaultOrder: {
      column: 'name',
      reverse: false
    }
  } );

  module.addInputGroup( '', {
    name: {
      title: 'Name',
      type: 'string'
    },
    participant_count: {
      title: 'Participants',
      type: 'string',
      isConstant: true,
      help: 'Participants can only be added to this availability type by going directly to participant details.'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnAvailabilityTypeAdd', [
    'CnAvailabilityTypeModelFactory',
    function( CnAvailabilityTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnAvailabilityTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnAvailabilityTypeList', [
    'CnAvailabilityTypeModelFactory',
    function( CnAvailabilityTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnAvailabilityTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnAvailabilityTypeView', [
    'CnAvailabilityTypeModelFactory',
    function( CnAvailabilityTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnAvailabilityTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnAvailabilityTypeListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnAvailabilityTypeViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root ); }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnAvailabilityTypeModelFactory', [
    'CnBaseModelFactory', 'CnAvailabilityTypeListFactory', 'CnAvailabilityTypeViewFactory',
    function( CnBaseModelFactory, CnAvailabilityTypeListFactory, CnAvailabilityTypeViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.listModel = CnAvailabilityTypeListFactory.instance( this );
        this.viewModel = CnAvailabilityTypeViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
