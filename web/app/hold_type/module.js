define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'hold_type', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: { column: ['type','name'] },
    name: {
      singular: 'hold type',
      plural: 'hold types',
      possessive: 'hold type\'s'
    },
    columnList: {
      type: { column: 'hold_type.type', title: 'Type' },
      name: { column: 'hold_type.name', title: 'Name' },
      participant_count: {
        title: 'Participants',
        type: 'number'
      },
      role_list: {
        title: 'Roles'
      }
    },
    defaultOrder: {
      column: 'CONCAT( hold_type.type, " ", hold_type.name )',
      reverse: false
    }
  } );

  module.addInputGroup( '', {
    type: {
      title: 'Type',
      type: 'enum'
    },
    name: {
      title: 'Name',
      type: 'string'
    },
    description: {
      title: 'Description',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnHoldTypeAdd', [
    'CnHoldTypeModelFactory',
    function( CnHoldTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnHoldTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnHoldTypeList', [
    'CnHoldTypeModelFactory',
    function( CnHoldTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnHoldTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnHoldTypeView', [
    'CnHoldTypeModelFactory',
    function( CnHoldTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnHoldTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnHoldTypeAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnHoldTypeListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnHoldTypeViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) {
        CnBaseViewFactory.construct( this, parentModel, root, 'participant' );

        var self = this;
        async function init() {
          // allow add/delete of roles and participants
          await self.deferred.promise;

          if( angular.isDefined( self.roleModel ) )
            self.roleModel.getChooseEnabled = function() { return parentModel.getEditEnabled(); };
        }

        init();
      }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnHoldTypeModelFactory', [
    'CnBaseModelFactory', 'CnHoldTypeListFactory', 'CnHoldTypeAddFactory', 'CnHoldTypeViewFactory',
    function( CnBaseModelFactory, CnHoldTypeListFactory, CnHoldTypeAddFactory, CnHoldTypeViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnHoldTypeAddFactory.instance( this );
        this.listModel = CnHoldTypeListFactory.instance( this );
        this.viewModel = CnHoldTypeViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
