define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'failed_login', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {}, // standard
    name: {
      singular: 'failed login',
      plural: 'failed logins',
      possessive: 'failed login\'s'
    },
    columnList: {
      user: {
        column: 'user.name',
        title: 'User'
      },
      application: {
        column: 'application.title',
        title: 'Application'
      },
      address: {
        title: 'Address',
      },
      datetime: {
        title: 'Date & Time',
        type: 'datetimesecond'
      }
    },
    defaultOrder: {
      column: 'datetime',
      reverse: true
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnFailedLoginList', [
    'CnFailedLoginModelFactory',
    function( CnFailedLoginModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnFailedLoginModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnFailedLoginListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnFailedLoginModelFactory', [
    'CnBaseModelFactory', 'CnFailedLoginListFactory',
    function( CnBaseModelFactory, CnFailedLoginListFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.listModel = CnFailedLoginListFactory.instance( this );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
