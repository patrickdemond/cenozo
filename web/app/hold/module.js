define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'hold', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {
      parent: {
        subject: 'participant',
        column: 'participant.uid'
      }
    },
    name: {
      singular: 'hold',
      plural: 'holds',
      possessive: 'hold\'s'
    },
    columnList: {
      hold_type: {
        column: 'hold_type.type',
        title: 'Type'
      },
      hold_name: {
        column: 'hold_type.name',
        title: 'Name'
      },
      datetime: {
        title: 'Date & Time',
        type: 'datetime'
      }
    },
    defaultOrder: {
      column: 'datetime',
      reverse: true
    }
  } );

  module.addInputGroup( '', {
    hold_type_id: {
      title: 'Hold Type',
      type: 'enum',
      help: 'If empty then the previous hold is cancelled.'
    },
    datetime: {
      title: 'Date & Time',
      type: 'datetimesecond',
      max: 'now',
      isExcluded: 'add'
    },
    user: {
      column: 'user.name',
      title: 'User',
      type: 'string',
      isExcluded: 'add'
    },
    site: {
      column: 'site.name',
      title: 'Site',
      type: 'string',
      isExcluded: 'add'
    },
    role: {
      column: 'role.name',
      title: 'Role',
      type: 'string',
      isExcluded: 'add'
    },
    application: {
      column: 'application.name',
      title: 'Application',
      type: 'string',
      isExcluded: 'add'
    },
    note: {
      title: 'Note',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnHoldAdd', [
    'CnHoldModelFactory',
    function( CnHoldModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnHoldModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnHoldList', [
    'CnHoldModelFactory',
    function( CnHoldModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnHoldModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnHoldView', [
    'CnHoldModelFactory',
    function( CnHoldModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnHoldModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnHoldAddFactory', [
    'CnBaseAddFactory', 'CnSession', 'CnModalMessageFactory',
    function( CnBaseAddFactory, CnSession, CnModalMessageFactory ) {
      var object = function( parentModel ) {
        CnBaseAddFactory.construct( this, parentModel );

        this.onAdd = async function( record ) {
          await this.$$onAdd( record );

          if( CnSession.finalHoldTypeList.findByProperty( 'name', 'Deceased' ).id == record.hold_type_id ) {
            await CnModalMessageFactory.instance( {
              title: 'Date of Death',
              message:
                'You have choosen to put the participant in a "Deceased" hold and you will now be returned ' +
                'to the participant\'s file.  If you have any information about the participant\'s date of ' +
                'death please enter it in the participant\'s defining details including whether only the ' +
                'year, year and month, or full date is known.'
            } ).show();
          }
        };
      };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnHoldListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnHoldViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root ); }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnHoldModelFactory', [
    'CnBaseModelFactory', 'CnHoldListFactory', 'CnHoldAddFactory', 'CnHoldViewFactory',
    'CnHttpFactory',
    function( CnBaseModelFactory, CnHoldListFactory, CnHoldAddFactory, CnHoldViewFactory,
              CnHttpFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnHoldAddFactory.instance( this );
        this.listModel = CnHoldListFactory.instance( this );
        this.viewModel = CnHoldViewFactory.instance( this, root );

        // extend getBreadcrumbTitle
        // (metadata's promise will have already returned so we don't have to wait for it)
        this.getBreadcrumbTitle = function() {
          var holdType = this.metadata.columnList.hold_type_id.enumList.findByProperty(
            'value', this.viewModel.record.hold_type_id );
          return holdType ? holdType.name : 'removed';
        };

        // extend getMetadata
        this.getMetadata = async function() {
          await this.$$getMetadata();

          var response = await CnHttpFactory.instance( {
            path: 'hold_type',
            data: {
              select: { column: [ 'id', 'type', 'name', 'access', 'system' ] },
              modifier: { order: [ 'type', 'name' ], limit: 1000 }
            }
          } ).query();

          this.metadata.columnList.hold_type_id.enumList = [];
          var self = this;
          response.data.forEach( function( item ) {
            self.metadata.columnList.hold_type_id.enumList.push( {
              value: item.id, name: item.type + ': ' + item.name, disabled: !item.access || item.system
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
