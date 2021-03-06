define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'participant_identifier', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {
      parent: {
        subject: 'identifier',
        column: 'identifier.name'
      }
    },
    name: {
      singular: 'participant identifier',
      plural: 'participant identifiers',
      possessive: 'participant identifier\'s'
    },
    columnList: {
      identifier: { column: 'identifier.name', title: 'Identifier' },
      uid: { column: 'participant.uid', title: 'UID' },
      value: { title: 'Value' }
    },
    defaultOrder: {
      column: 'participant.uid',
      reverse: false
    }
  } );

  module.addInputGroup( '', {
    participant_id: {
      column: 'participant_identifier.participant_id',
      title: 'Participant',
      type: 'lookup-typeahead',
      typeahead: {
        table: 'participant',
        select: 'CONCAT( participant.first_name, " ", participant.last_name, " (", uid, ")" )',
        where: [ 'participant.first_name', 'participant.last_name', 'uid' ]
      }
    },
    value: { type: 'string', title: 'Value' }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnParticipantIdentifierAdd', [
    'CnParticipantIdentifierModelFactory',
    function( CnParticipantIdentifierModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnParticipantIdentifierModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnParticipantIdentifierList', [
    'CnParticipantIdentifierModelFactory',
    function( CnParticipantIdentifierModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnParticipantIdentifierModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnParticipantIdentifierView', [
    'CnParticipantIdentifierModelFactory',
    function( CnParticipantIdentifierModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnParticipantIdentifierModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnParticipantIdentifierAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnParticipantIdentifierListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnParticipantIdentifierViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root ); }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnParticipantIdentifierModelFactory', [
    'CnBaseModelFactory',
    'CnParticipantIdentifierListFactory', 'CnParticipantIdentifierAddFactory', 'CnParticipantIdentifierViewFactory',
    function( CnBaseModelFactory,
              CnParticipantIdentifierListFactory, CnParticipantIdentifierAddFactory, CnParticipantIdentifierViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnParticipantIdentifierAddFactory.instance( this );
        this.listModel = CnParticipantIdentifierListFactory.instance( this );
        this.viewModel = CnParticipantIdentifierViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
