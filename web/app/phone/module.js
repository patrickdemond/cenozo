define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'phone', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {
      parent: [ {
        subject: 'participant',
        column: 'participant.uid'
      }, {
        subject: 'alternate',
        column: 'alternate_id'
      } ]
    },
    name: {
      singular: 'phone number',
      plural: 'phone numbers',
      possessive: 'phone number\'s',
      pluralPossessive: 'phone numbers\'',
      friendlyColumn: 'rank'
    },
    columnList: {
      rank: {
        title: 'Rank',
        type: 'rank'
      },
      number: {
        title: 'Number'
      },
      type: {
        title: 'Type'
      },
      active: {
        column: 'phone.active',
        title: 'Active',
        type: 'boolean'
      }
    },
    defaultOrder: {
      column: 'rank',
      reverse: false
    }
  } );

  module.addInputGroup( null, {
    address_id: {
      title: 'Associated Address',
      type: 'enum',
      help: 'The address that this phone number is associated with, if any.'
    },
    active: {
      title: 'Active',
      type: 'boolean'
    },
    international: {
      title: 'International',
      type: 'boolean',
      help: 'Cannot be changed once the phone number has been created.',
      noedit: true
    },
    rank: {
      title: 'Rank',
      type: 'rank'
    },
    type: {
      title: 'Type',
      type: 'enum'
    },
    number: {
      title: 'Number',
      type: 'string',
      help: 'If not international then must be in 000-000-0000 format.'
    },
    note: {
      title: 'Note',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnPhoneAdd', [
    'CnPhoneModelFactory',
    function( CnPhoneModelFactory ) {
      return {
        templateUrl: module.url + 'add.tpl.html',
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnPhoneModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnPhoneList', [
    'CnPhoneModelFactory',
    function( CnPhoneModelFactory ) {
      return {
        templateUrl: module.url + 'list.tpl.html',
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnPhoneModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnPhoneView', [
    'CnPhoneModelFactory',
    function( CnPhoneModelFactory ) {
      return {
        templateUrl: module.url + 'view.tpl.html',
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnPhoneModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnPhoneAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnPhoneListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnPhoneViewFactory', [
    'CnBaseViewFactory', 'CnHttpFactory', '$q',
    function( CnBaseViewFactory, CnHttpFactory, $q ) {
      var args = arguments;
      var CnBaseViewFactory = args[0];
      var object = function( parentModel, root ) {
        var self = this;
        CnBaseViewFactory.construct( this, parentModel, root );

        // extend onView
        this.onView = function() {
          return this.$$onView().then( function() {
            var parent = self.parentModel.getParentIdentifier();
            return CnHttpFactory.instance( {
              path: angular.isDefined( parent.subject )
                  ? [ parent.subject, parent.identifier, 'address' ].join( '/' )
                  : self.parentModel.getServiceCollectionPath().replace( 'phone', 'address' ),
              data: {
                select: { column: [ 'id', 'summary' ] },
                modifier: { order: 'rank' }
              }
            } ).query().then( function success( response ) {
              self.parentModel.metadata.columnList.address_id.enumList = [];
              response.data.forEach( function( item ) {
                self.parentModel.metadata.columnList.address_id.enumList.push( {
                  value: item.id, name: item.summary
                } );
              } );
            } );
          } );
        };
      };
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnPhoneModelFactory', [
    'CnBaseModelFactory', 'CnPhoneListFactory', 'CnPhoneAddFactory', 'CnPhoneViewFactory',
    function( CnBaseModelFactory, CnPhoneListFactory, CnPhoneAddFactory, CnPhoneViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnPhoneAddFactory.instance( this );
        this.listModel = CnPhoneListFactory.instance( this );
        this.viewModel = CnPhoneViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
