define( function() {

  'use strict';

  try { var module = cenozoApp.module( 'study', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: { column: 'name' },
    name: {
      singular: 'study',
      plural: 'studies',
      possessive: 'study\'s'
    },
    columnList: {
      name: { title: 'Name' },
      identifier: { column: 'identifier.name', title: 'Identifier' },
      consent_type: { column: 'consent_type.name', title: 'Consent Type' },
      completed_event_type: { column: 'event_type.name', title: 'Completed Event Type' },
      description: { column: 'study.description', title: 'Description', align: 'left' }
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
    identifier_id: {
      title: 'Special Identifier',
      type: 'enum',
      help: 'Whether a special identifier is used by the study.'
    },
    consent_type_id: {
      title: 'Extra Consent Type',
      type: 'enum',
      help: 'If selected then participants have withdrawn from the study when this consent-type is negative.'
    },
    completed_event_type_id: {
      title: 'Completed Event Type',
      type: 'enum',
      help: 'If selected then this event-type identifies when the study is complete.'
    },
    description: {
      title: 'Description',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnStudyAdd', [
    'CnStudyModelFactory',
    function( CnStudyModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnStudyModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnStudyList', [
    'CnStudyModelFactory',
    function( CnStudyModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnStudyModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnStudyView', [
    'CnStudyModelFactory',
    function( CnStudyModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnStudyModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStudyAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStudyListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStudyViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root, 'study_phase' ); }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStudyModelFactory', [
    'CnBaseModelFactory', 'CnStudyListFactory', 'CnStudyAddFactory', 'CnStudyViewFactory', 'CnHttpFactory',
    function( CnBaseModelFactory, CnStudyListFactory, CnStudyAddFactory, CnStudyViewFactory, CnHttpFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnStudyAddFactory.instance( this );
        this.listModel = CnStudyListFactory.instance( this );
        this.viewModel = CnStudyViewFactory.instance( this, root );

        // extend getMetadata
        this.getMetadata = async function() {
          var self = this;
          await this.$$getMetadata();

          var response = await CnHttpFactory.instance( {
            path: 'identifier',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: 'name', limit: 1000 }
            }
          } ).query();
          this.metadata.columnList.identifier_id.enumList = [];
          response.data.forEach( function( item ) {
            self.metadata.columnList.identifier_id.enumList.push( {
              value: item.id,
              name: item.name
            } );
          } );

          var response = await CnHttpFactory.instance( {
            path: 'consent_type',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: 'name', limit: 1000 }
            }
          } ).query();
          this.metadata.columnList.consent_type_id.enumList = [];
          response.data.forEach( function( item ) {
            self.metadata.columnList.consent_type_id.enumList.push( {
              value: item.id,
              name: item.name
            } );
          } );

          var response = await CnHttpFactory.instance( {
            path: 'event_type',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: 'name', limit: 1000 }
            }
          } ).query();
          this.metadata.columnList.completed_event_type_id.enumList = [];
          response.data.forEach( function( item ) {
            self.metadata.columnList.completed_event_type_id.enumList.push( {
              value: item.id,
              name: item.name
            } );
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
