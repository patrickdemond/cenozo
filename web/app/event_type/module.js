define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'event_type', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: { column: 'name' },
    name: {
      singular: 'event type',
      plural: 'event types',
      possessive: 'event type\'s'
    },
    columnList: {
      name: { title: 'Name' },
      event_count: {
        title: 'Events',
        type: 'number'
      },
      description: {
        title: 'Description',
        align: 'left'
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
    record_address: {
      title: 'Record Address',
      type: 'boolean'
    },
    description: {
      title: 'Description',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnEventTypeAdd', [
    'CnEventTypeModelFactory',
    function( CnEventTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnEventTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnEventTypeList', [
    'CnEventTypeModelFactory',
    function( CnEventTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnEventTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnEventTypeView', [
    'CnEventTypeModelFactory',
    function( CnEventTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnEventTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnEventTypeAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnEventTypeListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnEventTypeViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root ); };
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnEventTypeModelFactory', [
    'CnBaseModelFactory', 'CnEventTypeAddFactory', 'CnEventTypeListFactory', 'CnEventTypeViewFactory',
    function( CnBaseModelFactory, CnEventTypeAddFactory, CnEventTypeListFactory, CnEventTypeViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnEventTypeAddFactory.instance( this );
        this.listModel = CnEventTypeListFactory.instance( this );
        this.viewModel = CnEventTypeViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
