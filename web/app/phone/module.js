define( [ 'trace' ].reduce( function( list, name ) {
  return list.concat( cenozoApp.module( name ).getRequiredFiles() );
}, [] ), function() {
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

  module.addInputGroup( '', {
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
      isConstant: 'view'
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
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
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
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
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
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
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
    'CnBaseAddFactory', 'CnTraceModelFactory',
    function( CnBaseAddFactory, CnTraceModelFactory ) {
      var object = function( parentModel ) {
        CnBaseAddFactory.construct( this, parentModel );
        var traceModel = CnTraceModelFactory.root;

        // extend onNew
        this.onNew = async function( record ) {
          await this.$$onNew( record );
          await this.parentModel.updateAssociatedAddressList();
        };

        this.onAdd = async function( record ) {
          var identifier = this.parentModel.getParentIdentifier();
          var traceResponse = await traceModel.checkForTraceResolvedAfterPhoneAdded( identifier );
          if( traceResponse ) {
            await this.$$onAdd( record )
            if( angular.isString( traceResponse ) ) await traceModel.setTraceReason( identifier, traceResponse );
          } else {
            throw 'Cancelled by user';
          }
        };
      };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnPhoneListFactory', [
    'CnBaseListFactory', 'CnTraceModelFactory',
    function( CnBaseListFactory, CnTraceModelFactory ) {
      var object = function( parentModel ) {
        CnBaseListFactory.construct( this, parentModel );
        var traceModel = CnTraceModelFactory.root;

        this.onDelete = async function( record ) {
          var identifier = {
            subject: this.parentModel.getSubjectFromState(),
            identifier: this.parentModel.getQueryParameter( 'identifier', true )
          };
          var traceResponse = await traceModel.checkForTraceRequiredAfterPhoneRemoved( identifier );
          if( traceResponse ) {
            await this.$$onDelete( record );
            if( angular.isString( traceResponse ) ) await traceModel.setTraceReason( identifier, traceResponse );
          } else {
            throw 'Cancelled by user';
          }
        };
      };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnPhoneViewFactory', [
    'CnBaseViewFactory', 'CnTraceModelFactory',
    function( CnBaseViewFactory, CnTraceModelFactory ) {
      var object = function( parentModel, root ) {
        CnBaseViewFactory.construct( this, parentModel, root );
        var traceModel = CnTraceModelFactory.root;

        // extend onView
        this.onView = async function( force ) {
          await this.$$onView( force );
          await this.parentModel.updateAssociatedAddressList();
        };

        this.onPatch = async function( data ) {
          var identifier = this.parentModel.getParentIdentifier();
          var traceResponse = !angular.isDefined( data.active )
                            ? true
                            : data.active
                            ? await traceModel.checkForTraceResolvedAfterPhoneAdded( identifier )
                            : await traceModel.checkForTraceRequiredAfterPhoneRemoved( identifier );

          if( traceResponse ) {
            await this.$$onPatch( data );
            if( angular.isString( traceResponse ) ) await traceModel.setTraceReason( identifier, traceResponse );
          } else {
            this.record.active = this.backupRecord.active;
          }
        };

        this.onDelete = async function() {
          var identifier = this.parentModel.getParentIdentifier();
          var traceResponse = await traceModel.checkForTraceRequiredAfterPhoneRemoved( identifier );
          if( traceResponse ) {
            await this.$$onDelete();
            if( angular.isString( traceResponse ) ) return traceModel.setTraceReason( identifier, traceResponse );
          } else {
            throw 'Cancelled by user';
          }
        };
      };
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnPhoneModelFactory', [
    'CnBaseModelFactory', 'CnPhoneListFactory', 'CnPhoneAddFactory', 'CnPhoneViewFactory', 'CnHttpFactory',
    function( CnBaseModelFactory, CnPhoneListFactory, CnPhoneAddFactory, CnPhoneViewFactory, CnHttpFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnPhoneAddFactory.instance( this );
        this.listModel = CnPhoneListFactory.instance( this );
        this.viewModel = CnPhoneViewFactory.instance( this, root );

        // special function to update the associated address list
        this.updateAssociatedAddressList = async function() {
          var parent = this.getParentIdentifier();
          var response = await CnHttpFactory.instance( {
            path: angular.isDefined( parent.subject )
                ? [ parent.subject, parent.identifier, 'address' ].join( '/' )
                : this.getServiceCollectionPath().replace( 'phone', 'address' ),
            data: {
              select: { column: [ 'id', 'summary' ] },
              modifier: { order: 'rank' }
            }
          } ).query();

          this.metadata.columnList.address_id.enumList = [];
          var self = this;
          response.data.forEach( function( item ) {
            self.metadata.columnList.address_id.enumList.push( { value: item.id, name: item.summary } );
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
