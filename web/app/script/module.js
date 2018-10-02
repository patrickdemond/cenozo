define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'script', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: { column: 'name' },
    name: {
      singular: 'script',
      plural: 'scripts',
      possessive: 'script\'s'
    },
    columnList: {
      name: {
        column: 'script.name',
        title: 'Name'
      },
      survey_title: {
        title: 'Name'
      },
      supporting: {
        title: 'Supporting',
        type: 'boolean'
      },
      repeated: {
        title: 'Repeated',
        type: 'boolean'
      },
      access: {
        title: 'In Application',
        type: 'boolean'
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
    sid: {
      title: 'Survey',
      type: 'enum'
    },
    supporting: {
      title: 'Supporting',
      type: 'boolean',
      help: 'Identifies this as a supporting script (launched in the "Scripts" dropdown when viewing a participant)'
    },
    repeated: {
      title: 'Repeated',
      type: 'boolean'
    },
    started_event_type_id: {
      title: 'Started Event Type',
      type: 'enum'
    },
    finished_event_type_id: {
      title: 'Finished Event Type',
      type: 'enum'
    },
    description: {
      title: 'Description',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnScriptAdd', [
    'CnScriptModelFactory',
    function( CnScriptModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnScriptModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnScriptList', [
    'CnScriptModelFactory',
    function( CnScriptModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnScriptModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnScriptView', [
    'CnScriptModelFactory',
    function( CnScriptModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnScriptModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnScriptAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnScriptListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnScriptViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root ); }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnScriptModelFactory', [
    'CnBaseModelFactory', 'CnScriptAddFactory', 'CnScriptListFactory', 'CnScriptViewFactory', 'CnHttpFactory', '$q',
    function( CnBaseModelFactory, CnScriptAddFactory, CnScriptListFactory, CnScriptViewFactory, CnHttpFactory, $q ) {
      var object = function( root ) {
        var self = this;
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnScriptAddFactory.instance( this );
        this.listModel = CnScriptListFactory.instance( this );
        this.viewModel = CnScriptViewFactory.instance( this, root );

        // extend getMetadata
        this.getMetadata = function() {
          return this.$$getMetadata().then( function() {
            return $q.all( [
              CnHttpFactory.instance( {
                path: 'survey',
                data: {
                  select: { column: [ 'sid', 'title' ] },
                  modifier: { order: { title: false } }
                }
              } ).query().then( function( response ) {
                self.metadata.columnList.sid.enumList = [];
                response.data.forEach( function( item ) {
                  self.metadata.columnList.sid.enumList.push( { value: item.sid, name: item.title } );
                } );
              } ),

              CnHttpFactory.instance( {
                path: 'event_type',
                data: {
                  select: { column: [ 'id', 'name' ] },
                  modifier: { order: 'name' }
                }
              } ).query().then( function( response ) {
                self.metadata.columnList.started_event_type_id.enumList = [];
                self.metadata.columnList.finished_event_type_id.enumList = [];
                response.data.forEach( function( item ) {
                  self.metadata.columnList.started_event_type_id.enumList.push( { value: item.id, name: item.name } );
                  self.metadata.columnList.finished_event_type_id.enumList.push( { value: item.id, name: item.name } );
                } );
              } )
            ] );
          } );
        };
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
