define( function() {
  'use strict';

  try { cenozoApp.module( 'site', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( cenozoApp.module( 'site' ), {
    identifier: { column: 'name' },
    name: {
      singular: 'site',
      plural: 'sites',
      possessive: 'site\'s',
      pluralPossessive: 'sites\'',
      friendlyColumn: 'name'
    },
    columnList: {
      name: {
        column: 'site.name',
        title: 'Name'
      },
      role_count: {
        title: 'Roles',
        type: 'number'
      },
      user_count: {
        title: 'Users',
        type: 'number'
      },
      participant_count: {
        title: 'Participants',
        type: 'number'
      },
      last_access_datetime: {
        title: 'Last Access',
        type: 'datetime'
      }
    },
    defaultOrder: {
      column: 'name',
      reverse: false
    }
  } );

  cenozoApp.module( 'site' ).addInputGroup( null, {
    name: {
      title: 'Name',
      type: 'string'
    },
    timezone: {
      title: 'Time Zone',
      type: 'typeahead',
      typeahead: moment.tz.names()
    },
    title: {
      title: 'Institution',
      type: 'string'
    },
    phone_number: {
      title: 'Phone Number',
      type: 'string'
    },
    address1: {
      title: 'Address1',
      type: 'string'
    },
    address2: {
      title: 'Address2',
      type: 'string'
    },
    city: {
      title: 'City',
      type: 'string'
    },
    region_id: {
      title: 'Region',
      type: 'enum',
      constant: true,
      help: 'Cannot be changed once the site has been created.'
    },
    postcode: {
      title: 'Postcode',
      type: 'string',
      help: 'Must be in "A1A1A1" format, zip codes in "01234" format.'
    },
  } );

  var settingModule = cenozoApp.module( 'setting' );
  if( 0 <= settingModule.actions.indexOf( 'view' ) ) {
    cenozoApp.module( 'site' ).addViewOperation( 'Settings', function( viewModel, $state ) {
      $state.go( 'setting.view', { identifier: 'site_id=' + viewModel.record.id } );
    } );
  }

  /* ######################################################################################################## */
  cenozo.providers.controller( 'SiteAddCtrl', [
    '$scope', 'CnSiteModelFactory',
    function( $scope, CnSiteModelFactory ) {
      $scope.model = CnSiteModelFactory.root;
      $scope.record = {};
      $scope.model.addModel.onNew( $scope.record ).then( function() {
        $scope.model.setupBreadcrumbTrail( 'add' );
      } );
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.controller( 'SiteListCtrl', [
    '$scope', 'CnSiteModelFactory',
    function( $scope, CnSiteModelFactory ) {
      $scope.model = CnSiteModelFactory.root;
      $scope.model.listModel.onList( true ).then( function() {
        $scope.model.setupBreadcrumbTrail( 'list' );
      } );
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.controller( 'SiteViewCtrl', [
    '$scope', 'CnSiteModelFactory',
    function( $scope, CnSiteModelFactory ) {
      $scope.model = CnSiteModelFactory.root;
      $scope.model.viewModel.onView().then( function() {
        $scope.model.setupBreadcrumbTrail( 'view' );
      } );
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnSiteAdd', function() {
    return {
      templateUrl: 'app/site/add.tpl.html',
      restrict: 'E'
    };
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnSiteView', function() {
    return {
      templateUrl: 'app/site/view.tpl.html',
      restrict: 'E'
    };
  } );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnSiteAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnSiteListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnSiteViewFactory', [
    'CnBaseViewFactory',
    function( CnBaseViewFactory ) {
      var object = function( parentModel, root ) {
        var self = this;
        CnBaseViewFactory.construct( this, parentModel, root );

        // extend the onPatch function
        this.onPatch = function( data ) {
          return self.$$onPatch( data ).then( function() {
            // update the region
            if( angular.isDefined( data.postcode ) ) self.onView();
          } );
        };
      }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnSiteModelFactory', [
    'CnBaseModelFactory', 'CnSiteListFactory', 'CnSiteAddFactory', 'CnSiteViewFactory',
    'CnHttpFactory', '$q',
    function( CnBaseModelFactory, CnSiteListFactory, CnSiteAddFactory, CnSiteViewFactory,
              CnHttpFactory, $q ) {
      var object = function() {
        var self = this;
        CnBaseModelFactory.construct( this, cenozoApp.module( 'site' ) );
        this.addModel = CnSiteAddFactory.instance( this );
        this.listModel = CnSiteListFactory.instance( this );
        this.viewModel = CnSiteViewFactory.instance( this );

        // extend getMetadata
        this.getMetadata = function() {
          this.metadata.loadingCount++;
          return $q.all( [

            this.loadMetadata(),

            CnHttpFactory.instance( {
              path: 'region',
              data: {
                select: {
                  column: [
                    'id',
                    'country',
                    { column: 'CONCAT_WS( ", ", name, country )', alias: 'name', table_prefix: false }
                  ]
                },
                modifier: { order: ['country','name'], limit: 100 }
              }
            } ).query().then( function success( response ) {
              self.metadata.columnList.region_id.enumList = [];
              response.data.forEach( function( item ) {
                self.metadata.columnList.region_id.enumList.push( {
                  value: item.id,
                  country: item.country,
                  name: item.name
                } );
              } );
            } )

          ] ).finally( function finished() { self.metadata.loadingCount--; } );
        };
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
