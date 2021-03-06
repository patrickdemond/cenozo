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
      application: {
        title: 'Application'
      },
      qnaire_title: {
        title: 'Questionnaire'
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
      title: 'Limesurvey Questionnaire',
      type: 'enum'
    },
    pine_qnaire_id: {
      title: 'Pine Questionnaire',
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
    'CnBaseModelFactory', 'CnScriptAddFactory', 'CnScriptListFactory', 'CnScriptViewFactory', 'CnHttpFactory',
    function( CnBaseModelFactory, CnScriptAddFactory, CnScriptListFactory, CnScriptViewFactory, CnHttpFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnScriptAddFactory.instance( this );
        this.listModel = CnScriptListFactory.instance( this );
        this.viewModel = CnScriptViewFactory.instance( this, root );

        // extend getMetadata
        this.getMetadata = async function() {
          var self = this;
          await this.$$getMetadata();
          var response = await CnHttpFactory.instance( {
            path: 'survey',
            data: {
              select: { column: [ 'sid', 'title' ] },
              modifier: { order: { title: false }, limit: 1000 }
            }
          } ).query();
          this.metadata.columnList.sid.enumList = [];
          response.data.forEach( function( item ) {
            self.metadata.columnList.sid.enumList.push( { value: item.sid, name: item.title } );
          } );

          var response = await CnHttpFactory.instance( {
            path: 'pine_qnaire',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: { name: false }, limit: 1000 }
            }
          } ).query();
          this.metadata.columnList.pine_qnaire_id.enumList = [];
          response.data.forEach( function( item ) {
            self.metadata.columnList.pine_qnaire_id.enumList.push( { value: item.id, name: item.name } );
          } );

          var response = await CnHttpFactory.instance( {
            path: 'event_type',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: 'name', limit: 1000 }
            }
          } ).query();
          this.metadata.columnList.started_event_type_id.enumList = [];
          this.metadata.columnList.finished_event_type_id.enumList = [];
          response.data.forEach( function( item ) {
            self.metadata.columnList.started_event_type_id.enumList.push( { value: item.id, name: item.name } );
            self.metadata.columnList.finished_event_type_id.enumList.push( { value: item.id, name: item.name } );
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
