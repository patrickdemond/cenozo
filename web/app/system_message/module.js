define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'system_message', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {}, // standard
    name: {
      singular: 'system message',
      plural: 'system messages',
      possessive: 'system message\'s',
      friendlyColumn: 'title'
    },
    columnList: {
      title: {
        column: 'system_message.title',
        title: 'Title'
      },
      application: {
        column: 'application.title',
        title: 'Application'
      },
      site: {
        column: 'site.name',
        title: 'Site'
      },
      role: {
        column: 'role.name',
        title: 'Role'
      },
      expiry: {
        title: 'Expiry',
        type: 'date'
      }
    },
    defaultOrder: {
      column: 'title',
      reverse: false
    }
  } );

  module.addInputGroup( '', {
    application_id: {
      column: 'system_message.application_id',
      title: 'Application',
      type: 'enum',
      isExcluded: function( $state, model ) { return model.hasAllSites() ? false : 'add'; },
      isConstant: function( $state, model ) { return model.hasAllSites() ? false : 'view'; },
      help: 'Leaving the site blank will show the message across all applications.'
    },
    site_id: {
      title: 'Site',
      type: 'enum',
      help: 'Leaving the site blank will show the message across all sites.  If application is blank then this ' +
            'will be ignored.',
      isExcluded: function( $state, model ) { return model.hasAllSites() ? false : 'add'; },
      isConstant: function( $state, model ) { return model.hasAllSites() ? false : 'view'; },
    },
    role_id: {
      title: 'Role',
      type: 'enum',
      help: 'Leaving the site blank will show the message across all roles.'
    },
    title: {
      column: 'system_message.title',
      title: 'Title',
      type: 'string'
    },
    expiry: {
      title: 'Expiry',
      type: 'date',
      help: 'The day after which the message will no longer appear',
      min: 'now'
    },
    note: {
      title: 'Note',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnSystemMessageAdd', [
    'CnSystemMessageModelFactory',
    function( CnSystemMessageModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnSystemMessageModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnSystemMessageList', [
    'CnSystemMessageModelFactory',
    function( CnSystemMessageModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnSystemMessageModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnSystemMessageView', [
    'CnSystemMessageModelFactory',
    function( CnSystemMessageModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnSystemMessageModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnSystemMessageAddFactory', [
    'CnBaseAddFactory', 'CnSession',
    function( CnBaseAddFactory, CnSession ) {
      var object = function( parentModel ) {
        CnBaseAddFactory.construct( this, parentModel );

        this.onNew = async function view( record ) {
          await this.$$onNew( record );

          // force the default application to be this application
          record.application_id = CnSession.application.id;
        };
      };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnSystemMessageListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnSystemMessageViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root ); }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnSystemMessageModelFactory', [
    'CnBaseModelFactory',
    'CnSystemMessageListFactory', 'CnSystemMessageAddFactory', 'CnSystemMessageViewFactory',
    'CnSession', 'CnHttpFactory',
    function( CnBaseModelFactory,
              CnSystemMessageListFactory, CnSystemMessageAddFactory, CnSystemMessageViewFactory,
              CnSession, CnHttpFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnSystemMessageAddFactory.instance( this );
        this.listModel = CnSystemMessageListFactory.instance( this );
        this.viewModel = CnSystemMessageViewFactory.instance( this, root );

        this.hasAllSites = function() { return CnSession.role.allSites; };

        // extend getMetadata
        this.getMetadata = async function() {
          var self = this;
          await this.$$getMetadata();

          var response = await CnHttpFactory.instance( {
            path: 'site',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: 'name', limit: 1000 }
            }
          } ).query();
          this.metadata.columnList.site_id.enumList = [];
          response.data.forEach( function( item ) {
            self.metadata.columnList.site_id.enumList.push( { value: item.id, name: item.name } );
          } );

          var response = await CnHttpFactory.instance( {
            path: 'role',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: {
                where: [ { column: 'tier', operator: '<=', value: CnSession.role.tier } ],
                order: 'name',
                limit: 1000
              }
            }
          } ).query();
          this.metadata.columnList.role_id.enumList = [];
          response.data.forEach( function( item ) {
            self.metadata.columnList.role_id.enumList.push( { value: item.id, name: item.name } );
          } );

          // create metadata for application_id (this application only)
          this.metadata.columnList.application_id.enumList = [ {
            value: CnSession.application.id,
            name: CnSession.application.title
          } ];
        };
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
