define( [ 'study' ].reduce( function( list, name ) {
  return list.concat( cenozoApp.module( name ).getRequiredFiles() );
}, [] ), function() {
  'use strict';

  try { var module = cenozoApp.module( 'stratum', true ); } catch( err ) { console.warn( err ); return; }
  angular.extend( module, {
    identifier: {
      parent: {
        subject: 'study',
        column: 'study.name'
      }
    },
    name: {
      singular: 'stratum',
      plural: 'strata',
      possessive: 'strata\'s'
    },
    columnList: {
      name: { title: 'Name' },
      participant_count: { title: 'Participants', type: 'number' },
      refused_count: { title: 'Refused', type: 'number' },
      consented_count: { title: 'Consented', type: 'number' },
      completed_count: { title: 'Completed', type: 'number' },
      description: { column: 'stratum.description', title: 'Description', align: 'left' }
    },
    defaultOrder: {
      column: 'name',
      reverse: false
    }
  } );

  module.addInputGroup( '', {
    name: { title: 'Name', type: 'string' },
    participant_count: {
      title: 'Total Participants',
      type: 'string',
      isConstant: true,
      isExcluded: 'add'
    },
    refused_count: {
      title: 'Total Refused Consent',
      type: 'string',
      isConstant: true,
      isExcluded: 'add'
    },
    consented_count: {
      title: 'Total Accepted Consent',
      type: 'string',
      isConstant: true,
      isExcluded: 'add'
    },
    completed_count: {
      title: 'Total Completed Event',
      type: 'string',
      isConstant: true,
      isExcluded: 'add'
    },
    description: { title: 'Description', type: 'text' }
  } );

  module.addExtraOperation( 'view', {
    title: 'Manage Participants',
    operation: function( $state, model ) {
      $state.go( 'stratum.mass_participant', { identifier: model.viewModel.record.getIdentifier() } );
    },
    isIncluded: function( $state, model ) { return model.getEditEnabled(); }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnStratumAdd', [
    'CnStratumModelFactory',
    function( CnStratumModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnStratumModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnStratumList', [
    'CnStratumModelFactory',
    function( CnStratumModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnStratumModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnStratumMassParticipant', [
    'CnStratumMassParticipantFactory', 'CnSession', '$state',
    function( CnStratumMassParticipantFactory, CnSession, $state ) {
      return {
        templateUrl: module.getFileUrl( 'mass_participant.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnStratumMassParticipantFactory.instance();

          $scope.model.onLoad().then( function() {
            CnSession.setBreadcrumbTrail( [ {
              title: 'Strata',
              go: function() { return $state.go( 'stratum.list' ); }
            }, {
              title: $scope.model.stratumName,
              go: function() { return $state.go( 'stratum.view', { identifier: $scope.model.stratumId } ); }
            }, {
              title: 'Manage Participants'
            } ] );
          } );
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnStratumView', [
    'CnStratumModelFactory',
    function( CnStratumModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnStratumModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStratumAddFactory', [
    'CnBaseAddFactory',
    function( CnBaseAddFactory ) {
      var object = function( parentModel ) { CnBaseAddFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStratumListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStratumMassParticipantFactory', [
    'CnSession', 'CnHttpFactory', 'CnModalMessageFactory', 'CnParticipantSelectionFactory', '$state',
    function( CnSession, CnHttpFactory, CnModalMessageFactory, CnParticipantSelectionFactory, $state ) {
      var object = function() {
        var self = this;
        angular.extend( this, {
          operation: 'add',
          working: false,
          participantSelection: CnParticipantSelectionFactory.instance( {
            path: ['stratum', $state.params.identifier, 'participant'].join( '/' ),
            data: { mode: 'confirm', operation: 'add' }
          } ),
          stratumId: $state.params.identifier,
          stratumName: null,

          onLoad: function() {
            // reset data
            return CnHttpFactory.instance( {
              path: 'stratum/' + this.stratumId,
              data: { select: { column: 'name' } }
            } ).get().then( function( response ) {
              self.stratumName = response.data.name;
              self.participantSelection.reset();
            } );
          },

          inputsChanged: function() {
            this.participantSelection.data.operation = this.operation;
            this.participantSelection.reset();
          },

          proceed: function() {
            this.working = true;
            if( !this.participantSelection.confirmInProgress && 0 < this.participantSelection.confirmedCount ) {
              CnHttpFactory.instance( {
                path: ['stratum', this.stratumId, 'participant'].join( '/' ),
                data: {
                  mode: 'update',
                  identifier_id: this.participantSelection.identifierId,
                  identifier_list: this.participantSelection.getIdentifierList(),
                  operation: this.operation
                },
                onError: function( response ) {
                  CnModalMessageFactory.httpError( response ).then( function() {
                    $state.go( 'stratum.view', { identifier: self.stratumId } );
                  } );
                }
              } ).post().then( function( response ) {
                CnModalMessageFactory.instance( {
                  title: 'Participants Added',
                  message: 'You have successfully ' + ( 'add' == self.operation ? 'added ' : 'removed ' ) +
                           self.participantSelection.confirmedCount + ' participant ' +
                           ( 'add' == self.operation ? 'to' : 'from' ) + ' the "' + self.stratumName + '" stratum.'
                } ).show().then( function() {
                  $state.go( 'stratum.view', { identifier: self.stratumId } );
                } );
              } ).finally( function() { self.working = false; } );
            }
          }

        } );
      }
      return { instance: function() { return new object(); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStratumViewFactory', [
    'CnBaseViewFactory', 'CnSession', 'CnHttpFactory', 'CnModalMessageFactory',
    function( CnBaseViewFactory, CnSession, CnHttpFactory, CnModalMessageFactory ) {
      var object = function( parentModel, root ) {
        var self = this;
        CnBaseViewFactory.construct( this, parentModel, root, 'participant' );

        this.deferred.promise.then( function() {
          if( angular.isDefined( self.participantModel ) ) {
            self.participantModel.getChooseEnabled = function() { return false; };
          }
        } );
      };
      return { instance: function( parentModel, root ) { return new object( parentModel, root ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnStratumModelFactory', [
    'CnBaseModelFactory', 'CnStratumListFactory', 'CnStratumAddFactory', 'CnStratumViewFactory',
    function( CnBaseModelFactory, CnStratumListFactory, CnStratumAddFactory, CnStratumViewFactory ) {
      var object = function( root ) {
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnStratumAddFactory.instance( this );
        this.listModel = CnStratumListFactory.instance( this );
        this.viewModel = CnStratumViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
