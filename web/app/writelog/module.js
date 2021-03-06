define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'writelog', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {}, // standard
    name: {
      singular: 'write operation',
      plural: 'write operations',
      possessive: 'write operation\'s'
    },
    columnList: {
      user: {
        column: 'user.name',
        title: 'User'
      },
      site: {
        column: 'site.name',
        title: 'Site'
      },
      role: {
        column: 'role.name',
        title: 'Role'
      },
      method: {
        title: 'Method'
      },
      path: {
        title: 'Path'
      },
      completed: {
        title: 'Completed',
        type: 'boolean',
        help: 'Whether the operation completed without any errors'
      },
      elapsed: {
        title: 'Elapsed',
        help: 'The time in seconds that the operation took to complete'
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
  cenozo.providers.directive( 'cnWritelogList', [
    'CnWritelogModelFactory',
    function( CnWritelogModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnWritelogModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnWritelogListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnWritelogModelFactory', [
    'CnBaseModelFactory', 'CnWritelogListFactory',
    function( CnBaseModelFactory, CnWritelogListFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.listModel = CnWritelogListFactory.instance( this );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
