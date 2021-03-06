define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'recording', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: { column: 'rank' },
    name: {
      singular: 'recording',
      plural: 'recordings',
      possessive: 'recording\''
    },
    columnList: {
      rank: {
        title: 'Rank',
        type: 'rank'
      },
      name: {
        title: 'Name'
      },
      record: {
        title: 'Record',
        type: 'boolean'
      },
      timer: {
        title: 'Timer'
      }
    },
    defaultOrder: {
      column: 'rank',
      reverse: false
    }
  } );

  module.addInputGroup( '', {
    rank: {
      title: 'Rank',
      type: 'rank'
    },
    name: {
      title: 'Name',
      type: 'string'
    },
    record: {
      title: 'Record',
      type: 'boolean',
      help: 'Whether the participant should be recorded during this stage.'
    },
    timer: {
      title: 'Timer',
      type: 'string',
      format: 'integer',
      minValue: 1,
      help: 'The number of seconds to limit the stage to (empty meaning no limit)'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnRecordingAdd', [
    'CnRecordingModelFactory',
    function( CnRecordingModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnRecordingModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnRecordingList', [
    'CnRecordingModelFactory',
    function( CnRecordingModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnRecordingModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnRecordingView', [
    'CnRecordingModelFactory',
    function( CnRecordingModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnRecordingModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnRecordingAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnRecordingListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnRecordingViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root ); };
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnRecordingModelFactory', [
    'CnBaseModelFactory', 'CnRecordingListFactory', 'CnRecordingAddFactory', 'CnRecordingViewFactory',
    function( CnBaseModelFactory, CnRecordingListFactory, CnRecordingAddFactory, CnRecordingViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnRecordingAddFactory.instance( this );
        this.listModel = CnRecordingListFactory.instance( this );
        this.viewModel = CnRecordingViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
