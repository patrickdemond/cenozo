define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'consent', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {
      parent: {
        subject: 'participant',
        column: 'participant.uid'
      }
    },
    name: {
      singular: 'consent',
      plural: 'consents',
      possessive: 'consent\'s',
      pluralPossessive: 'consents\'',
      friendlyColumn: 'datetime'
    },
    columnList: {
      consent_type: {
        column: 'consent_type.name',
        title: 'Consent Type'
      },
      accept: {
        title: 'Accept',
       type: 'boolean'
      },
      written: {
        title: 'Written',
        type: 'boolean'
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
    consent_type_id: {
      title: 'Consent Type',
      type: 'enum',
      constant: 'view'
    },
    accept: {
      title: 'Accept',
      type: 'boolean',
      constant: 'view'
    },
    written: {
      title: 'Written',
      type: 'boolean',
      constant: 'view'
    },
    datetime: {
      title: 'Date & Time',
      type: 'datetimesecond',
      max: 'now'
    },
    note: {
      title: 'Note',
      type: 'text'
    }
  } );

  module.addExtraOperation( 'view', {
    title: 'View Form',
    isIncluded: function( $state, model ) { return angular.isDefined( model.viewModel.formId ); },
    isDisabled: function( $state, model ) { return !model.viewModel.formId; },
    operation: function( $state, model ) { $state.go( 'form.view', { identifier: model.viewModel.formId } ); }
  } ); 

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnConsentAdd', [
    'CnConsentModelFactory',
    function( CnConsentModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnConsentModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnConsentList', [
    'CnConsentModelFactory',
    function( CnConsentModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnConsentModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnConsentView', [
    'CnConsentModelFactory',
    function( CnConsentModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnConsentModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnConsentAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnConsentListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnConsentViewFactory', [
    'CnBaseViewFactory', 'CnHttpFactory',
    function( CnBaseViewFactory, CnHttpFactory ) {
      var object = function( parentModel, root ) {
        var self = this;
        CnBaseViewFactory.construct( this, parentModel, root );

        // override onView method
        this.onView = function() {
          this.formId = undefined;
          return this.$$onView().then( function() {
            self.parentModel.metadata.promise.then( function() {
              if( self.parentModel.metadata.columnList.consent_type_id.enumList.findByProperty(
                  'value', self.record.consent_type_id ).name == 'participation' ) {
                CnHttpFactory.instance( {
                  path: 'form_type/name=consent/form',
                  data: {
                    select: { column: [ 'id' ] },
                    modifier: {
                      where: [ { column: 'record_id', operator: '=', value: self.record.id } ],
                      order: { date: true }
                    }
                  }
                } ).get().then( function( response ) {
                  self.formId = 0 < response.data.length ? response.data[0].id : null;
                } );
              }
            } );
          } );
        };
      }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnConsentModelFactory', [
    'CnBaseModelFactory', 'CnConsentListFactory', 'CnConsentAddFactory', 'CnConsentViewFactory',
    'CnHttpFactory',
    function( CnBaseModelFactory, CnConsentListFactory, CnConsentAddFactory, CnConsentViewFactory,
              CnHttpFactory ) {
      var object = function( root ) {
        var self = this;
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnConsentAddFactory.instance( this );
        this.listModel = CnConsentListFactory.instance( this );
        this.viewModel = CnConsentViewFactory.instance( this, root );

        // extend getBreadcrumbTitle
        // (metadata's promise will have already returned so we don't have to wait for it)
        this.getBreadcrumbTitle = function() {
          var consentType = self.metadata.columnList.consent_type_id.enumList.findByProperty(
            'value', this.viewModel.record.consent_type_id );
          return consentType ? consentType.name : 'unknown';
        };

        // extend getMetadata
        this.getMetadata = function() {
          return this.$$getMetadata().then( function() {
            return CnHttpFactory.instance( {
              path: 'consent_type',
              data: {
                select: { column: [ 'id', 'name' ] },
                modifier: { order: 'name' }
              }
            } ).query().then( function success( response ) {
              self.metadata.columnList.consent_type_id.enumList = [];
              response.data.forEach( function( item ) {
                self.metadata.columnList.consent_type_id.enumList.push( { value: item.id, name: item.name } );
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
