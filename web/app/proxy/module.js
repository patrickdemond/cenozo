define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'proxy', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {
      parent: {
        subject: 'participant',
        column: 'participant.uid'
      }
    },
    name: {
      singular: 'proxy',
      plural: 'proxies',
      possessive: 'proxy\'s',
      pluralPossessive: 'proxies\''
    },
    columnList: {
      proxy_type: {
        column: 'proxy_type.name',
        title: 'Proxy Type'
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
    proxy_type_id: {
      title: 'Proxy Type',
      type: 'enum',
      help: 'If empty then the previous proxy is cancelled.'
    },
    datetime: {
      title: 'Date & Time',
      type: 'datetimesecond',
      max: 'now',
      exclude: 'add'
    },
    user: {
      column: 'user.name',
      title: 'User',
      type: 'string',
      exclude: 'add'
    },
    site: {
      column: 'site.name',
      title: 'Site',
      type: 'string',
      exclude: 'add'
    },
    role: {
      column: 'role.name',
      title: 'Role',
      type: 'string',
      exclude: 'add'
    },
    application: {
      column: 'application.name',
      title: 'Application',
      type: 'string',
      exclude: 'add'
    },
    note: {
      title: 'Note',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnProxyAdd', [
    'CnProxyModelFactory',
    function( CnProxyModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnProxyModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnProxyList', [
    'CnProxyModelFactory',
    function( CnProxyModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnProxyModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnProxyView', [
    'CnProxyModelFactory',
    function( CnProxyModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnProxyModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnProxyAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnProxyListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnProxyViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) {
        var self = this;
        CnBaseViewFactory.construct( this, parentModel, root );

        // extend onView
        this.onView = function() {
          return this.$$onView().then( function() {
            // Since the international column is read-only and belongs to a different table we can fake
            // the expected Yes/No value by changing it here
            if( null != self.record.international )
              self.record.international = self.record.international ? 'Yes' : 'No';
          } );
        };
      }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnProxyModelFactory', [
    'CnBaseModelFactory', 'CnProxyListFactory', 'CnProxyAddFactory', 'CnProxyViewFactory',
    'CnHttpFactory',
    function( CnBaseModelFactory, CnProxyListFactory, CnProxyAddFactory, CnProxyViewFactory,
              CnHttpFactory ) {
      var object = function( root ) {
        var self = this;
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnProxyAddFactory.instance( this );
        this.listModel = CnProxyListFactory.instance( this );
        this.viewModel = CnProxyViewFactory.instance( this, root );

        // extend getBreadcrumbTitle
        // (metadata's promise will have already returned so we don't have to wait for it)
        this.getBreadcrumbTitle = function() {
          var proxyType = self.metadata.columnList.proxy_type_id.enumList.findByProperty(
            'value', this.viewModel.record.proxy_type_id );
          return proxyType ? proxyType.name : 'removed';
        };

        // extend getMetadata
        this.getMetadata = function() {
          return this.$$getMetadata().then( function() {
            return CnHttpFactory.instance( {
              path: 'proxy_type',
              data: {
                select: { column: [ 'id', 'name' ] },
                modifier: { order: 'name' }
              }
            } ).query().then( function success( response ) {
              self.metadata.columnList.proxy_type_id.enumList = [];
              response.data.forEach( function( item ) {
                self.metadata.columnList.proxy_type_id.enumList.push( { value: item.id, name: item.name } );
              } );
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