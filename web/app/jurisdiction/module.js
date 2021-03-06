define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'jurisdiction', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {}, // standard
    name: {
      singular: 'jurisdiction',
      plural: 'jurisdictions',
      possessive: 'jurisdiction\'s'
    },
    columnList: {
      site: {
        column: 'site.name',
        title: 'Site'
      },
      postcode: {
        column: 'jurisdiction.postcode',
        title: 'Postcode'
      },
      longitude: {
        title: 'Longitude'
      },
      latitude: {
        title: 'Latitude'
      }
    },
    defaultOrder: {
      column: 'jurisdiction.postcode',
      reverse: false
    }
  } );

  module.addInputGroup( '', {
    site_id: {
      title: 'Site',
      type: 'enum'
    },
    postcode: {
      title: 'Postcode',
      type: 'string',
      regex: '^(([A-Z][0-9][A-Z] [0-9][A-Z][0-9])|([0-9]{5}))$',
      help: 'Non-international postal codes must be in "A1A 1A1" format, zip codes in "01234" format.'
    },
    longitude: {
      title: 'Longitude',
      type: 'string',
      format: 'float',
    },
    latitude: {
      title: 'Latitude',
      type: 'string',
      format: 'float',
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnJurisdictionAdd', [
    'CnJurisdictionModelFactory',
    function( CnJurisdictionModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnJurisdictionModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnJurisdictionList', [
    'CnJurisdictionModelFactory',
    function( CnJurisdictionModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnJurisdictionModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnJurisdictionView', [
    'CnJurisdictionModelFactory',
    function( CnJurisdictionModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnJurisdictionModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnJurisdictionAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnJurisdictionListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnJurisdictionViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) { CnBaseViewFactory.construct( this, parentModel, root ); }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnJurisdictionModelFactory', [
    'CnBaseModelFactory', 'CnJurisdictionListFactory', 'CnJurisdictionAddFactory', 'CnJurisdictionViewFactory',
    'CnHttpFactory',
    function( CnBaseModelFactory, CnJurisdictionListFactory, CnJurisdictionAddFactory, CnJurisdictionViewFactory,
              CnHttpFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnJurisdictionAddFactory.instance( this );
        this.listModel = CnJurisdictionListFactory.instance( this );
        this.viewModel = CnJurisdictionViewFactory.instance( this, root );

        // extend getMetadata
        this.getMetadata = async function() {
          await this.$$getMetadata();

          var response = await CnHttpFactory.instance( {
            path: 'application/0/site',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: 'name', limit: 1000 }
            }
          } ).query();

          this.metadata.columnList.site_id.enumList = [];
          var self = this;
          response.data.forEach( function( item ) {
            self.metadata.columnList.site_id.enumList.push( { value: item.id, name: item.name } );
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
