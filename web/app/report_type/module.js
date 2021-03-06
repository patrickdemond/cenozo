define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'report_type', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: { column: 'title' },
    name: {
      singular: 'report type',
      plural: 'report types',
      possessive: 'report type\'s'
    },
    columnList: {
      title: { title: 'Title' },
      subject: { title: 'Subject' },
      description: {
        title: 'Description',
        align: 'left'
      }
    },
    defaultOrder: {
      column: 'title',
      reverse: false
    }
  } );

  module.addInputGroup( '', {
    title: {
      title: 'Title',
      type: 'string'
    },
    subject: {
      title: 'Subject',
      type: 'string'
    },
    description: {
      title: 'Description',
      type: 'text'
    }
  } );

  module.children.some( function( child ) {
    if( 'report' == child.subject.snake ) {
      if( angular.isDefined( child.actions.add ) ) {
        module.addExtraOperation( 'view', {
          title: 'Run Report',
          operation: async function( $state, model ) {
            await model.viewModel.onViewPromise;
            await $state.go( 'report_type.add_report', { parentIdentifier: model.viewModel.record.getIdentifier() } );
          }
        } );
      }
      return true; // stop processing
    }
  } );


  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnReportTypeAdd', [
    'CnReportTypeModelFactory',
    function( CnReportTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnReportTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnReportTypeList', [
    'CnReportTypeModelFactory',
    function( CnReportTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnReportTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnReportTypeView', [
    'CnReportTypeModelFactory',
    function( CnReportTypeModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnReportTypeModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnReportTypeAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnReportTypeListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnReportTypeViewFactory', [
    'CnBaseViewFactory', 'CnSession',
    function( CnBaseViewFactory, CnSession ) {
      var object = function( parentModel, root ) {
        CnBaseViewFactory.construct( this, parentModel, root, 'report' );
        this.onViewPromise = null;

        // track the promise returned by the onView function
        this.onView = async function( force ) { this.onViewPromise = await this.$$onView( force ); };

        var self = this;
        async function init() {
          await self.deferred.promise;

          if( angular.isDefined( self.reportModel ) )
            self.reportModel.listModel.heading = 'Generated Report List';
          if( angular.isDefined( self.reportScheduleModel ) )
            self.reportScheduleModel.listModel.heading = 'Schedule List';
          if( angular.isDefined( self.reportRestrictionModel ) )
            self.reportRestrictionModel.listModel.heading = 'Parameter List';
          if( angular.isDefined( self.applicationTypeModel ) )
            self.applicationTypeModel.getChooseEnabled = function() { return 3 <= CnSession.role.tier; };
          if( angular.isDefined( self.roleModel ) )
            self.roleModel.getChooseEnabled = function() { return 3 <= CnSession.role.tier };
        }

        init();
      };
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnReportTypeModelFactory', [
    'CnBaseModelFactory', 'CnReportTypeAddFactory', 'CnReportTypeListFactory', 'CnReportTypeViewFactory',
    function( CnBaseModelFactory, CnReportTypeAddFactory, CnReportTypeListFactory, CnReportTypeViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnReportTypeAddFactory.instance( this );
        this.listModel = CnReportTypeListFactory.instance( this );
        this.viewModel = CnReportTypeViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
