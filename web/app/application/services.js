define( [
  cenozo.baseUrl + '/app/application/module.js',
  cenozo.baseUrl + '/app/participant/bootstrap.js',
  cenozo.baseUrl + '/app/site/bootstrap.js',
  cenozo.baseUrl + '/app/user/bootstrap.js'
], function( module ) {
  'use strict';

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnApplicationAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); }; 
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnApplicationListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnApplicationViewFactory', [
    'CnBaseViewFactory', 'CnParticipantModelFactory', 'CnSiteModelFactory', 'CnUserModelFactory',
    function( CnBaseViewFactory, CnParticipantModelFactory, CnSiteModelFactory, CnUserModelFactory ) {
      var object = function( parentModel ) {
        CnBaseViewFactory.construct( this, parentModel );

        ////////////////////////////////////
        // factory customizations start here
        var self = this;
        this.participantModel = CnParticipantModelFactory.instance();
        this.participantModel.enableChoose( true );
        this.siteModel = CnSiteModelFactory.instance();
        this.siteModel.enableChoose( true );
        this.userModel = CnUserModelFactory.instance();
        this.userModel.enableChoose( true );

        this.view = function view() {
          return this.viewRecord().then( function() {
            self.participantModel.listModel.onList( true );
            self.siteModel.listModel.onList( true );
            self.userModel.listModel.onList( true );
          } );
        };
        // factory customizations end here
        //////////////////////////////////
      };

      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnApplicationModelFactory', [
    'CnBaseModelFactory', 'CnApplicationListFactory', 'CnApplicationAddFactory', 'CnApplicationViewFactory',
    function( CnBaseModelFactory, CnApplicationListFactory, CnApplicationAddFactory, CnApplicationViewFactory ) {
      var object = function() {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnApplicationAddFactory.instance( this );
        this.listModel = CnApplicationListFactory.instance( this );
        this.viewModel = CnApplicationViewFactory.instance( this );

        this.enableAdd( true );
        this.enableDelete( true );
        this.enableView( true );

        // customize identifier
        this.getIdentifierFromRecord = function( record ) { return 'name=' + record.name; };
      };

      return {
        root: new object(),
        instance: function() { return new object(); }
      };
    }
  ] );

} );
