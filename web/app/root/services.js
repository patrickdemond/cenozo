define( [], function() {

  'use strict';

  /* ######################################################################################################## */
  cnCachedProviders.factory( 'CnHomeModelFactory', [
    'CnAppSingleton',
    function( CnAppSingleton ) {
      var object = function() {
        var self = this;
        this.promise = CnAppSingleton.promise.then( function() {
          self.application = CnAppSingleton.application;
          self.user = CnAppSingleton.user;
          self.role = CnAppSingleton.role;
          self.site = CnAppSingleton.site;
        } );
      };

      return {
        root: new object(),
        instance: function() { return new object(); }
      };
    }
  ] );

} );
