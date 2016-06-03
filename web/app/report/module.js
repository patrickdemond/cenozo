define( function() {
  'use strict';

  try { var module = cenozoApp.module( 'report', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {
      parent: {
        subject: 'report_type',
        column: 'report_type.name'
      }
    },
    name: {
      singular: 'report',
      plural: 'reports',
      possessive: 'report\'s',
      pluralPossessive: 'reports\''
    },
    columnList: {
      report_type: {
        column: 'report_type.name',
        title: 'Report Type'
      },
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

  module.addInputGroup( '', {
    report_schedule: {
      title: 'Schedule',
      type: 'string',
      exclude: 'add',
      constant: true
    },
    user: {
      column: 'user.name',
      title: 'User',
      type: 'string',
      exclude: 'add',
      constant: true
    },
    site: {
      column: 'site.name',
      title: 'Site',
      type: 'string',
      exclude: 'add',
      constant: true
    },
    role: {
      column: 'role.name',
      title: 'Role',
      type: 'string',
      exclude: 'add',
      constant: true
    },
    datetime: {
      title: 'Date & Time',
      type: 'datetimesecond',
      exclude: 'add',
      constant: true
    },
    format: {
      title: 'Format',
      type: 'enum',
      constant: 'view'
    }
  } );

  module.addInputGroup( 'Parameters', { restrict_placeholder: { type: 'hidden' } }, true );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnReportAdd', [
    'CnReportModelFactory', 'CnHttpFactory', '$timeout',
    function( CnReportModelFactory, CnHttpFactory, $timeout ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnReportModelFactory.root;

          // change the heading to the form's title
          CnHttpFactory.instance( {
            path: 'report_type/' + $scope.model.getParentIdentifier().identifier,
            data: { select: { column: [ 'name' ] } }
          } ).get().then( function( response ) {
            $scope.model.addModel.heading = 'Create ' + response.data.name + ' Report';
          } );

          // wait a smidge for the directive to render then rebuild the 
          $timeout( function() {
            // remove the parameters group heading
            var parameterData = $scope.$$childHead.dataArray.findByProperty( 'title', 'Parameters' );
            document.querySelector( '[name="Parameters"]' ).querySelector( 'div' ).remove();

            // remove all restrict_* columns in the metadata
            for( var column in $scope.model.metadata.columnList )
              if( 'restrict_' == column.substring( 0, 9 ) )
                delete $scope.model.metadata.columnList[column];

            // remove all restrict_* columns in the base-add directive's dataArray
            parameterData.inputArray = parameterData.inputArray.filter( function( input ) {
              return 'restrict_' != input.key.substring( 0, 9 );
            } );

            // add restrictions back into the metadata and dataArray
            $scope.model.rebuildFormRestrictions().then( function( restrictionList ) {
              restrictionList.forEach( function( restriction ) {
                var key = 'restrict_' + restriction.name;
                var type = restriction.restriction_type;
                if( 'table' == type ) {
                  type = 'enum';
                } else if( 'uid_list' == type ) {
                  type = 'text';
                } else if( 'integer' == type ) {
                  type = 'string';
                } else if( 'decimal' == type ) {
                  type = 'string';
                }

                $scope.model.metadata.columnList[key] = { required: restriction.mandatory };
                parameterData.inputArray.push( {
                  key: key,
                  type: type,
                  title: restriction.title,
                  help: restriction.description
                } );
              } );
            } );
          }, 200 );
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnReportList', [
    'CnReportModelFactory',
    function( CnReportModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnReportModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnReportView', [
    'CnReportModelFactory', 'CnHttpFactory', '$timeout',
    function( CnReportModelFactory, CnHttpFactory, $timeout ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnReportModelFactory.root;

          // wait a smidge for the directive to render then rebuild the 
          $scope.model.viewModel.afterView( function() {
            // change the heading to the form's title
            CnHttpFactory.instance( {
              path: 'report_type/' + $scope.model.getParentIdentifier().identifier,
              data: { select: { column: [ 'name' ] } }
            } ).get().then( function( response ) {
              $scope.model.viewModel.heading = response.data.name + ' Report Details';
            } );

            // remove the parameters group heading
            var parameterData = $scope.$$childHead.dataArray.findByProperty( 'title', 'Parameters' );

            // remove all restrict_* columns in the base-add directive's dataArray
            parameterData.inputArray = parameterData.inputArray.filter( function( input ) {
              return 'restrict_' != input.key.substring( 0, 9 );
            } );

            // add restrictions back into the dataArray
            $scope.model.rebuildFormRestrictions().then( function( restrictionList ) {
              restrictionList.forEach( function( restriction ) {
                var key = 'restrict_' + restriction.name;
                var type = restriction.restriction_type;
                if( 'table' == type ) {
                  type = 'enum';
                } else if( 'uid_list' == type ) {
                  type = 'text';
                } else if( 'integer' == type ) {
                  type = 'string';
                } else if( 'decimal' == type ) {
                  type = 'string';
                }

                parameterData.inputArray.push( {
                  key: key,
                  type: type,
                  title: restriction.title,
                  help: restriction.description
                } );
              } );
            } );
          } );
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnReportAddFactory', [
    'CnBaseAddFactory', 'CnHttpFactory',
    function( CnBaseAddFactory, CnHttpFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnReportListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnReportViewFactory', [
    'CnBaseViewFactory', 'CnHttpFactory',
    function( CnBaseViewFactory, CnHttpFactory ) {
      var object = function( parentModel, root ) {
        var self = this;
        CnBaseViewFactory.construct( this, parentModel, root );

        // extend onView
        this.onView = function() {
          return this.$$onView().then( function() {
            // get the report restriction values
            CnHttpFactory.instance( {
              path: 'report/' + self.record.getIdentifier() + '/report_restriction'
            } ).query().then( function( response ) {
              response.data.forEach( function( restriction ) {
                self.record['restrict_'+restriction.name] = restriction.value;
              } );
            } );
          } );
        };
      }
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnReportModelFactory', [
    'CnBaseModelFactory', 'CnReportListFactory', 'CnReportAddFactory', 'CnReportViewFactory',
    'CnHttpFactory',
    function( CnBaseModelFactory, CnReportListFactory, CnReportAddFactory, CnReportViewFactory,
              CnHttpFactory ) {
      var object = function( root ) {
        var self = this;
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnReportAddFactory.instance( this );
        this.listModel = CnReportListFactory.instance( this );
        this.viewModel = CnReportViewFactory.instance( this, root );
        this.restrictionList = [];

        // extend getBreadcrumbTitle
        // (metadata's promise will have already returned so we don't have to wait for it)
        this.getBreadcrumbTitle = function() {
          var reportType = self.metadata.columnList.report_type_id.enumList.findByProperty(
            'value', this.viewModel.record.report_type_id );
          return reportType ? reportType.name : 'unknown';
        };

        // extend getMetadata
        this.getMetadata = function() {
          return this.$$getMetadata().then( function() {
            return CnHttpFactory.instance( {
              path: 'report_type',
              data: {
                select: { column: [ 'id', 'name' ] },
                modifier: { order: 'name' }
              }
            } ).query().then( function success( response ) {
              self.metadata.columnList.report_type_id.enumList = [];
              response.data.forEach( function( item ) {
                self.metadata.columnList.report_type_id.enumList.push( { value: item.id, name: item.name } );
              } );
            } );
          } );
        };

        this.rebuildFormRestrictions = function() {
          return CnHttpFactory.instance( {
            path: 'report_type/' + this.getParentIdentifier().identifier + '/report_restriction'
          } ).get().then( function( response ) { return response.data; } );
        };
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );