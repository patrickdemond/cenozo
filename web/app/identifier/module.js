define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'identifier', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: { column: 'name' },
    name: {
      singular: 'identifier',
      plural: 'identifiers',
      possessive: 'identifier\'s'
    },
    columnList: {
      name: { title: 'Name' },
      regex: { title: 'Format' },
      description: {
        title: 'Description',
        type: 'text'
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
    regex: {
      title: 'Format',
      type: 'string',
      help: 'This is a regular expression used to make sure all identifiers follow a particular format.'
    },
    description: {
      title: 'Description',
      type: 'text'
    }
  } );

  module.addExtraOperation( 'view', {
    title: 'Import Participant Identifiers',
    operation: async function( $state, model ) {
      await $state.go( 'identifier.import', { identifier: model.viewModel.record.getIdentifier() } );
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnIdentifierAdd', [
    'CnIdentifierModelFactory',
    function( CnIdentifierModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnIdentifierModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnIdentifierList', [
    'CnIdentifierModelFactory',
    function( CnIdentifierModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnIdentifierModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnIdentifierView', [
    'CnIdentifierModelFactory',
    function( CnIdentifierModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnIdentifierModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnIdentifierImport', [
    'CnIdentifierModelFactory', 'CnSession', '$state',
    function( CnIdentifierModelFactory, CnSession, $state ) {
      return {
        templateUrl: module.getFileUrl( 'import.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: async function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnIdentifierModelFactory.root;

          await $scope.model.viewModel.onView();

          CnSession.setBreadcrumbTrail( [ {
            title: 'Identifiers',
            go: async function() { return await $state.go( 'identifier.list' ); }
          }, {
            title: $scope.model.viewModel.record.name,
            go: async function() {
              return await $state.go( 'identifier.view', { identifier: $scope.model.viewModel.record.getIdentifier() } );
            }
          }, {
            title: 'Import Participant Identifiers'
          } ] );
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnIdentifierAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnIdentifierListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnIdentifierViewFactory', [
    'CnBaseViewFactory', 'CnHttpFactory', '$rootScope', '$state',
    function( CnBaseViewFactory, CnHttpFactory, $rootScope, $state ) {
      var object = function( parentModel, root ) {
        CnBaseViewFactory.construct( this, parentModel, root );

        angular.extend( this, {
          reset: function() {
            this.uploadReadReady = false;
            this.working = false;
            this.file = null;
            this.fileCheckResults = null;
          },

          cancel: async function() {
            this.reset();
            await $state.go( 'identifier.view', { identifier: this.record.getIdentifier() } );
          },

          checkImport: function() {
            if( !this.uploadReadReady ) {
              // need to wait for cnUpload to do its thing
              var self = this;
              $rootScope.$on( 'cnUpload read', async function() {
                self.working = true;
                self.uploadReadReady = true;

                var data = new FormData();
                data.append( 'file', self.file );

                // check the imported file
                try {
                  var response = await CnHttpFactory.instance( {
                    path: self.parentModel.getServiceResourcePath() + '?import=check',
                    data: self.file
                  } ).patch();

                  self.fileCheckResults = angular.fromJson( response.data );
                } finally {
                  self.working = false;
                }
              } );
            }
          },

          applyImport: async function() {
            // apply the patch file
            try {
              this.working = true;
              await CnHttpFactory.instance( {
                path: this.parentModel.getServiceResourcePath() + '?import=apply',
                data: this.file
              } ).patch();

              this.reset();
              $state.go( 'identifier.view', { identifier: this.record.getIdentifier() } );
            } finally {
              this.working = false;
            }
          }
        } );

        this.reset();
      }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnIdentifierModelFactory', [
    'CnBaseModelFactory', 'CnIdentifierListFactory', 'CnIdentifierAddFactory', 'CnIdentifierViewFactory',
    function( CnBaseModelFactory, CnIdentifierListFactory, CnIdentifierAddFactory, CnIdentifierViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnIdentifierAddFactory.instance( this );
        this.listModel = CnIdentifierListFactory.instance( this );
        this.viewModel = CnIdentifierViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
