define( [
  cnCenozoUrl + '/app/activity/module.js'
], function( module ) {

  'use strict';

  /* ######################################################################################################## */
  cnCachedProviders.factory( 'CnActivityListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cnCachedProviders.factory( 'CnActivityModelFactory', [
    'CnBaseModelFactory', 'CnActivityListFactory',
    function( CnBaseModelFactory, CnActivityListFactory ) {
      var object = function() {
        CnBaseModelFactory.construct( this, module );
        this.cnList = CnActivityListFactory.instance( this );
      };

      return {
        root: new object(),
        instance: function() { return new object(); }
      };
    }
  ] );

} );
