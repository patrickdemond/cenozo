define( [ 'address', 'consent', 'event', 'participant', 'phone', 'site' ].reduce( function( list, name ) {
  return list.concat( cenozoApp.module( name ).getRequiredFiles() );
}, [] ), function() {
  'use strict';

  try { var module = cenozoApp.module( 'export', true ); } catch( err ) { console.warn( err ); return; }

  angular.extend( module, {
    identifier: { column: 'title' },
    name: {
      singular: 'export',
      plural: 'exports',
      possessive: 'export\'s',
      pluralPossessive: 'exports\''
    },
    columnList: {
      title: { title: 'Title' },
      user: {
        column: 'user.name',
        title: 'Owner'
      },
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

  // define inputs
  module.addInputGroup( '', {
    title: {
      title: 'Title',
      type: 'string'
    },
    user_id: {
      title: 'Owner',
      type: 'lookup-typeahead',
      typeahead: {
        table: 'user',
        select: 'CONCAT( first_name, " ", last_name, " (", name, ")" )',
        where: [ 'first_name', 'last_name', 'name' ]
      },
      exclude: 'add'
    },
    description: {
      title: 'Description',
      type: 'text'
    }
  } );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnExportAdd', [
    'CnExportModelFactory',
    function( CnExportModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'add.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnExportModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnExportList', [
    'CnExportModelFactory',
    function( CnExportModelFactory ) {
      return {
        templateUrl: module.getFileUrl( 'list.tpl.html' ),
        restrict: 'E',
        scope: { model: '=?' },
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnExportModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.directive( 'cnExportView', [
    'CnExportModelFactory', 'CnSession', '$state',
    function( CnExportModelFactory, CnSession, $state ) {
      return {
        templateUrl: module.getFileUrl( 'view.tpl.html' ),
        restrict: 'E',
        controller: function( $scope ) {
          if( angular.isUndefined( $scope.model ) ) $scope.model = CnExportModelFactory.root;
        }
      };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnExportAddFactory', [
    'CnBaseAddFactory', 'CnSession', '$state',
    function( CnBaseAddFactory, CnSession, $state ) {
      var object = function( parentModel ) {
        var self = this;
        CnBaseAddFactory.construct( this, parentModel );

        // immediately view the export record after it has been created
        this.transitionOnSave = function( record ) {
          CnSession.workingTransition( function() {
            $state.go( 'export.view', { identifier: 'title=' + record.title } );
          } );
        };
      };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnExportListFactory', [
    'CnBaseListFactory',
    function( CnBaseListFactory ) {
      var object = function( parentModel ) { CnBaseListFactory.construct( this, parentModel ); };
      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnExportViewFactory', [
    'CnBaseViewFactory',
    'CnParticipantModelFactory', 'CnAddressModelFactory', 'CnPhoneModelFactory', 'CnSiteModelFactory',
    'CnConsentModelFactory', 'CnEventModelFactory',
    'CnSession', 'CnHttpFactory', 'CnModalDatetimeFactory', '$q',
    function( CnBaseViewFactory,
              CnParticipantModelFactory, CnAddressModelFactory, CnPhoneModelFactory, CnSiteModelFactory,
              CnConsentModelFactory, CnEventModelFactory,
              CnSession, CnHttpFactory, CnModalDatetimeFactory, $q ) {
      var object = function( parentModel, root ) {
        var self = this;
        CnBaseViewFactory.construct( this, parentModel, root );

        this.onView = function() {
          return this.$$onView().then( function() {
            return CnHttpFactory.instance( {
              path: 'export/' + self.record.getIdentifier() + '/export_column',
              data: {
                select: { column: [ 'id', 'rank', 'table_name', 'column_name', 'subtype' ] },
                modifier: { order: { rank: false } }
              }
            } ).query().then( function( response ) {
              self.columnList = [];
              var promiseList = [];
              response.data.forEach( function( item ) {
                self.columnList.push( {
                  id: item.id,
                  rank: item.rank,
                  type: item.table_name,
                  column: self.columnTypeList[item.table_name].list.findByProperty( 'key', item.column_name ),
                  subtype: null == item.subtype ? null : item.subtype.toString(),
                  isUpdating: false
                } );

                // load the restriction list
                promiseList.push( self.loadRestrictionList( item.table_name ) );
              } );
              self.columnListIsLoading = false;
              return $q.all( promiseList ).then( function() {
                return CnHttpFactory.instance( {
                  path: 'export/' + self.record.getIdentifier() + '/export_restriction',
                  data: {
                    select: {
                      column: [ 'id', 'export_column_id', 'rank', 'column_name', 'logic', 'test', 'value', {
                        table: 'export_column',
                        column: 'table_name',
                        alias: 'type'
                      } ]
                    },
                    modifier: { order: { rank: false } }
                  }
                } ).query().then( function( response ) {
                  self.restrictionList = [];
                  response.data.forEach( function( item ) {
                    var restriction = {
                      id: item.id,
                      column: self.columnList.findByProperty( 'id', item.export_column_id ),
                      rank: item.rank,
                      restriction:
                        self.restrictionTypeList[item.type].list.findByProperty( 'key', item.column_name ),
                      logic: item.logic,
                      value: isNaN( parseInt( item.value ) ) ? item.value : parseInt( item.value ),
                      test: item.test,
                      isUpdating: false
                    };
                    restriction.columnId = restriction.column.id;
                    if( cenozo.isDatetimeType( restriction.restriction.type ) ) {
                      restriction.formattedValue = CnSession.formatValue(
                        restriction.value, restriction.restriction.type, true
                      );
                    } else {
                      if( null == restriction.value ) restriction.value = '';
                    }
                    self.restrictionList.push( restriction );
                  } );
                  self.restrictionListIsLoading = false;
                  self.updateParticipantCount();
                } )
              } );
            } );
          } );
        };

        angular.extend( this, {
          modelList: {
            participant: CnParticipantModelFactory.root,
            site: CnSiteModelFactory.root,
            address: CnAddressModelFactory.root,
            phone: CnPhoneModelFactory.root,
            consent: CnConsentModelFactory.root,
            event: CnEventModelFactory.root
          },
          extendedSiteSelection: 'mastodon' == CnSession.application.type,
          columnListIsLoading: true,
          restrictionListIsLoading: true,
          participantCount: 0,
          restrictionList: [],
          restrictionTypeList: {
            participant: {
              isLoading: true,
              promise: null,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            site: {
              isLoading: true,
              promise: null,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            address: {
              isLoading: true,
              promise: null,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            phone: {
              isLoading: true,
              promise: null,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            consent: {
              isLoading: true,
              promise: null,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            event: {
              isLoading: true,
              promise: null,
              list: [ { key: undefined, title: 'Loading...' } ]
            }
          },
          applicationRestrictionList: [],
          applicationRestrictionTypeList: [ { key: undefined, title: 'Loading...' } ],
          columnTypeList: {
            participant: {
              isLoading: true,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            site: {
              isLoading: true,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            address: {
              isLoading: true,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            phone: {
              isLoading: true,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            consent: {
              isLoading: true,
              list: [ { key: undefined, title: 'Loading...' } ]
            },
            event: {
              isLoading: true,
              list: [ { key: undefined, title: 'Loading...' } ]
            }
          },
          newColumn: {},
          columnList: [],
          columnSubtypeList: {
            site: [
              { key: 'effective', name: 'Effective' },
              { key: 'default', name: 'Default' },
              { key: 'preferred', name: 'Preferred' }
            ],
            address: [
              { key: 'primary', name: 'Primary' },
              { key: 'first', name: 'First' }
            ],
            consent: [],
            event: []
          },

          addRestriction: function( type, key ) {
            var item = {
              restriction: this.restrictionTypeList[type].list.findByProperty( 'key', key ),
              value: null,
              logic: 'and',
              test: '<=>',
              isUpdating: false
            };

            // we need to associate this restriction with a column of the same type
            this.columnList.some( function( column ) {
              if( type === column.type ) {
                item.column = column;
                item.columnId = column.id;
                return true;
              }
            } );

            if( 'boolean' == item.restriction.type ) {
              item.value = true;
            } else if( 'dob' == item.restriction.type || 'datetime' == item.restriction.type ) {
              var datetime = moment();
              if( 'dob' == item.restriction.type ) datetime.subtract( 50, 'years' );
              item.value = datetime.format( 'dob' == item.restriction.type ? 'YYYY-MM-DD' : null );
              item.formattedValue = CnSession.formatValue( item.value, item.restriction.type, true );
            } else if( 'enum' == item.restriction.type ) {
              item.value = item.restriction.enumList[0].value;
            } else if( 'string' == item.restriction.type ) {
              item.value = '';
            }

            CnHttpFactory.instance( {
              path: 'export/' + this.record.getIdentifier() + '/export_restriction',
              data: {
                export_column_id: item.column.id,
                rank: this.restrictionList.length + 1,
                column_name: key,
                logic: item.logic,
                test: item.test,
                value: item.value
              }
            } ).post().then( function( response ) {
              item.id = response.data;
              self.restrictionList.push( item );
              self.newRestriction = undefined;
              self.updateParticipantCount();
            } );
          },

          updateRestriction: function( restrictionId, key ) {
            var restriction = this.restrictionList.findByProperty( 'id', restrictionId );
            var data = {};
            if( angular.isArray( key ) ) {
              key.forEach( function( k ) { data[k] = restriction[k]; } );
            } else {
              data[key] = restriction[key];
            }
            for( var key in data ) if( 'export_column_id' == key ) data[key] = restriction.column.id;

            restriction.isUpdating = true;
            return CnHttpFactory.instance( {
              path: 'export_restriction/' + restriction.id,
              data: data
            } ).patch().finally( function() {
              restriction.isUpdating = false;
              self.updateParticipantCount();
            } );
          },

          removeRestriction: function( index ) {
            CnHttpFactory.instance( {
              path: 'export_restriction/' + this.restrictionList[index].id
            } ).delete().then( function() {
              self.restrictionList.splice( index, 1 );
              self.updateParticipantCount();
            } );
          },

          selectRestrictionColumn: function( index ) {
            var item = this.restrictionList[index];
            item.column = this.columnList.findByProperty( 'id', item.columnId );
            item.columnId = item.column.id;
            return this.updateRestriction( item.id, 'export_column_id' );
          },

          selectDatetime: function( index ) {
            var item = this.restrictionList[index];
            if( 'dob' != item.restriction.type && 'datetime' != item.restriction.type ) {
              console.error( 'Tried to select datetime for restriction type "' + item.restriction.type + '".' );
            } else {
              CnModalDatetimeFactory.instance( {
                title: item.restriction.title,
                date: item.value,
                pickerType: item.restriction.type,
                emptyAllowed: !item.restriction.required
              } ).show().then( function( response ) {
                if( false !== response ) {
                  var key = 'value';
                  item.value = null == response ? null : response.replace( /Z$/, '' ); // remove the Z at the end
                  if( null == item.value && '<=>' != item.test && '<>' != item.test ) {
                    item.test = '<=>';
                    key = ['test','value'];
                  }
                  self.updateRestriction( item.id, key ).then( function() {
                    item.formattedValue = CnSession.formatValue( response, item.restriction.type, true );
                  } );
                }
              } );
              this.updateParticipantCount();
            }
          },

          addApplicationRestriction: function( key ) {
            var restriction = this.applicationRestrictionTypeList.findByProperty( 'key', key );
            var item = {
              restriction: restriction,
              logic: 'and',
              test: '<=>'
            };

            if( 'boolean' == item.restriction.type ) {
              item.value = true;
            } else if( 'enum' == item.restriction.type ) {
              item.value = item.restriction.enumList[0].value;
            }

            this.restrictionList.push( item );
            this.newApplicationRestriction = undefined;
            this.updateParticipantCount();
          },

          updateParticipantCount: function() {
            this.confirmInProgress = true;

            // get a count of participants to be included in the export
            CnHttpFactory.instance( {
              path: 'export/' + this.record.getIdentifier() + '/participant'
            } ).count().then( function( response ) {
              self.participantCount = parseInt( response.headers( 'Total' ) );
            } ).finally( function() {
              self.confirmInProgress = false;
            } );
          },

          addColumn: function( type, key ) {
            var column = this.columnTypeList[type].list.findByProperty( 'key', key );
            if( column ) {
              var subtype = angular.isDefined( this.columnSubtypeList[type] )
                          ? this.columnSubtypeList[type][0].key
                          : null;

              CnHttpFactory.instance( {
                path: 'export/' + this.record.getIdentifier() + '/export_column',
                data: {
                  table_name: type,
                  column_name: column.key,
                  subtype: subtype,
                  rank: self.columnList.length + 1
                }
              } ).post().then( function( response ) {
                self.columnList.push( {
                  id: response.data,
                  type: type,
                  column: column,
                  subtype: subtype,
                  isUpdating: false
                } );
                self.columnList.forEach( function( item, index ) { item.rank = index + 1; } ); // re-rank
              } );
            }
            this.newColumn[type] = undefined;

            // now make sure the type's restriction list is loaded
            this.loadRestrictionList( type );
          },

          moveColumn: function( oldIndex, newIndex ) {
            CnHttpFactory.instance( {
              path: 'export_column/' + this.columnList[oldIndex].id,
              data: { rank: newIndex + 1 }
            } ).patch().then( function() {
              var column = self.columnList.splice( oldIndex, 1 );
              self.columnList.splice( newIndex, 0, column[0] );
              self.columnList.forEach( function( item, index ) { item.rank = index + 1; } ); // re-rank
            } );
          },

          updateColumn: function( columnId, key ) {
            var column = this.columnList.findByProperty( 'id', columnId );
            var data = {};
            if( angular.isArray( key ) ) {
              key.forEach( function( k ) { data[k] = column[k]; } );
            } else {
              data[key] = column[key];
            }
            column.isUpdating = true;
            return CnHttpFactory.instance( {
              path: 'export_column/' + column.id,
              data: data
            } ).patch().finally( function() {
              column.isUpdating = false;
            } );
          },

          removeColumn: function( index ) {
            // first move restrictions to another column, or remove them
            var removeColumn = this.columnList[index];

            // find a column with the same subtype to move the restrictions to
            var switchColumn = null;
            this.columnList.some( function( column ) {
              if( column.id != removeColumn.id &&
                  column.type == removeColumn.type &&
                  column.subtype == removeColumn.subtype ) {
                switchColumn = column;
                return true;
              }
            } );

            var promiseList = [];
            if( null == switchColumn ) {
              this.restrictionList = this.restrictionList.filter( function( restriction ) {
                return restriction.columnId != removeColumn.id;
              } );
            } else {
              this.restrictionList.forEach( function( restriction, innerIndex ) {
                if( restriction.columnId == removeColumn.id ) {
                  restriction.columnId = switchColumn.id;
                  promiseList.push( self.selectRestrictionColumn( innerIndex ) );
                }
              } );
            }

            return $q.all( promiseList ).then( function() {
              self.updateParticipantCount();
              return CnHttpFactory.instance( {
                path: 'export_column/' + self.columnList[index].id
              } ).delete().then( function() {
                self.columnList.splice( index, 1 );
                self.columnList.forEach( function( item, index ) { item.rank = index + 1; } ); // re-rank
              } );
            } );
          },

          getSubtypeName: function( column, key ) {
            var name = column.type.ucWords();
            var subtypeList = this.columnSubtypeList[column.type];
            if( subtypeList ) {
              var subtype = subtypeList.findByProperty( 'key', key );
              if( subtype ) name += ' - ' + subtype.name;
            }
            return name;
          },

          getSubtypeList: function( column ) {
            var subtypeObj = {};
            return this.columnList.filter( function( item ) {
              return column.type == item.type;
            } ).filter( function( item ) {
              if( angular.isDefined( subtypeObj[item.subtype] ) ) {
                return false;
              } else {
                subtypeObj[item.subtype] = true;
                return true;
              }
            } );
          },

          getRestrictionColumnList: function( columnRank ) {
            if( angular.isUndefined( columnRank ) ) return [];

            var type = 'event';//this.columnList.findByProperty( 'rank', columnRank ).type;
            type = this.columnList.findByProperty( 'rank', columnRank ).type;
            var test = this.columnList.reduce( function( list, item ) {
              if( type === item.type && angular.isDefined( item.subtype ) ) {
                list.push( self.columnSubtypeList[type].findByProperty( 'key', item.subtype ) );
              }
              return list;
            }, [] );
             
            return test;
          },

          // define functions which populate the restriction lists
          loadRestrictionList: function( type ) {
            var ignoreColumnList = [
              'check_withdraw',
              'participant_id',
              'preferred_site_id'
            ];
            var restrictionType = this.restrictionTypeList[type];
            var metadata = this.modelList[type].metadata;

            // only load the restriction type list if we haven't already done so
            if( null == restrictionType.promise ) {
              restrictionType.promise = metadata.getPromise().then( function() {
                // add the site restriction type if not using extended site selection
                if( 'participant' == type && !self.extendedSiteSelection )
                  restrictionType.list.push( { key: 'site', title: 'Site', type: 'enum', required: false } );

                for( var column in metadata.columnList ) {
                  var item = metadata.columnList[column];
                  if( -1 == ignoreColumnList.indexOf( column ) ) {
                    var restrictionItem = {
                      key: column,
                      title: 'id' == column || 'uid' == column ?
                             column.toUpperCase() :
                             column.replace( /_/g, ' ' ).replace( / id/g, '' ).ucWords(),
                      type: 'tinyint' == item.data_type ? 'boolean' :
                            angular.isDefined( item.enumList ) ? 'enum' :
                            'datetime' == item.type | 'timestamp' == item.type ? 'datetime' :
                            'date_of_birth' == column ? 'dob' :
                            'varchar' ? 'string' : 'unknown',
                      required: item.required
                    };
                    
                    // add additional details to certain restriction types
                    if( 'boolean' == restrictionItem.type || 'enum' == restrictionItem.type ) {
                      restrictionItem.enumList = 'boolean' == restrictionItem.type
                                               ? [ { value: true, name: 'Yes' }, { value: false, name: 'No' } ]
                                               : angular.copy( item.enumList );
                      restrictionItem.enumList.unshift( { value: '', name: '(empty)' } );
                    }

                    restrictionType.list.push( restrictionItem );
                  }
                }

                var promiseList = [];
                if( 'participant' == type ) {
                  // add the site enum list if this site selection isn't extended
                  if( !self.extendedSiteSelection ) {
                    promiseList.push(
                      CnHttpFactory.instance( {
                        path: 'site',
                        data: {
                          select: { column: [ 'id', 'name' ] },
                          modifier: { order: ['name'] }
                        }
                      } ).query().then( function( response ) {
                        var item = self.restrictionTypeList.participant.list.findByProperty( 'key', 'site' );
                        item.enumList = [ { value: '', name: '(empty)' } ];
                        response.data.forEach( function( site ) {
                          item.enumList.push( { value: site.id, name: site.name } );
                        } );
                      } )
                    );
                  }

                  // participant.source_id is not filled in regularly, we must do it here
                  promiseList.push(
                    CnHttpFactory.instance( {
                      path: 'source',
                      data: {
                        select: { column: [ 'id', 'name' ] },
                        modifier: { order: ['name'] }
                      }
                    } ).query().then( function( response ) {
                      var item = restrictionType.list.findByProperty( 'key', 'source_id' );
                      item.enumList = item.required ? [] : [ { value: '', name: '(empty)' } ];
                      response.data.forEach( function( source ) {
                        item.enumList.push( { value: source.id, name: source.name } );
                      } );
                    } )
                  );

                  // participant.cohort_id is not filled in regularly, we must do it here
                  promiseList.push(
                    CnHttpFactory.instance( {
                      path: 'cohort',
                      data: {
                        select: { column: [ 'id', 'name' ] },
                        modifier: { order: ['name'] }
                      }
                    } ).query().then( function( response ) {
                      var item = restrictionType.list.findByProperty( 'key', 'cohort_id' );
                      item.enumList = item.required ? [] : [ { value: '', name: '(empty)' } ];
                      response.data.forEach( function( cohort ) {
                        item.enumList.push( { value: cohort.id, name: cohort.name } );
                      } );
                    } )
                  );
                }

                return $q.all( promiseList ).then( function() {
                  restrictionType.isLoading = false;
                  restrictionType.list.findByProperty( 'key', undefined ).title =
                    'Select a new ' + type + ' restriction...';
                } );
              } );
            }

            return restrictionType.promise;
          }
        } );

        var ignoreColumnList = [ 'address_id', 'alternate_id', 'participant_id' ];
        var promiseList = [

          this.modelList.participant.metadata.getPromise().then( function() {
            var column = self.columnTypeList.participant;
            for( var key in self.modelList.participant.metadata.columnList ) {
              column.list.push( {
                key: key,
                title: 'id' == key || 'uid' == key ?
                       key.toUpperCase() :
                       key.replace( /_/g, ' ' ).replace( / id/g, '' ).ucWords()
              } );
            }
            column.list.findByProperty( 'key', undefined ).title =
              'Add a Participant column...';
            column.isLoading = false;
          } ),

          this.modelList.site.metadata.getPromise().then( function() {
            for( var column in self.modelList.site.metadata.columnList ) {
              if( -1 == ignoreColumnList.indexOf( column ) ) {
                self.columnTypeList.site.list.push( {
                  key: column,
                  title: 'id' == column ?
                         column.toUpperCase() :
                         column.replace( /_/g, ' ' ).replace( / id/g, '' ).ucWords()
                } );
              }
            }
            self.columnTypeList.site.list.findByProperty( 'key', undefined ).title =
              'Add a Site column...';
            self.columnTypeList.site.isLoading = false;
          } ),

          this.modelList.address.metadata.getPromise().then( function() {
            for( var column in self.modelList.address.metadata.columnList ) {
              if( -1 == ignoreColumnList.indexOf( column ) ) {
                self.columnTypeList.address.list.push( {
                  key: column,
                  title: 'id' == column ?
                         column.toUpperCase() :
                         column.replace( /_/g, ' ' ).replace( / id/g, '' ).ucWords()
                } );
              }
            }
            self.columnTypeList.address.list.findByProperty( 'key', undefined ).title =
              'Add an Address column...';
            self.columnTypeList.address.isLoading = false;
          } ),

          this.modelList.phone.metadata.getPromise().then( function() {
            for( var column in self.modelList.phone.metadata.columnList ) {
              if( -1 == ignoreColumnList.indexOf( column ) ) {
                self.columnTypeList.phone.list.push( {
                  key: column,
                  title: 'id' == column ?
                         column.toUpperCase() :
                         column.replace( /_/g, ' ' ).replace( / id/g, '' ).ucWords()
                } );
              }
            }
            self.columnTypeList.phone.list.findByProperty( 'key', undefined ).title =
              'Add a Phone column...';
            self.columnTypeList.phone.isLoading = false;
          } ),

          this.modelList.consent.metadata.getPromise().then( function() {
            for( var column in self.modelList.consent.metadata.columnList ) {
              if( -1 == ignoreColumnList.indexOf( column ) ) {
                self.columnTypeList.consent.list.push( {
                  key: column,
                  title: 'id' == column ?
                         column.toUpperCase() :
                         column.replace( /_/g, ' ' ).replace( / id/g, '' ).ucWords()
                } );
              }
            }
            self.columnTypeList.consent.list.findByProperty( 'key', undefined ).title =
              'Add a Consent column...';
            self.columnTypeList.consent.isLoading = false;
          } ),

          CnHttpFactory.instance( {
            path: 'consent_type',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: ['name'] }
            }
          } ).query().then( function( response ) {
            response.data.forEach( function( item ) {
              self.columnSubtypeList.consent.push( { key: item.id.toString(), name: item.name } );
            } );
          } ),

          this.modelList.event.metadata.getPromise().then( function() {
            for( var column in self.modelList.event.metadata.columnList ) {
              if( -1 == ignoreColumnList.indexOf( column ) ) {
                self.columnTypeList.event.list.push( {
                  key: column,
                  title: 'id' == column ?
                         column.toUpperCase() :
                         column.replace( /_/g, ' ' ).replace( / id/g, '' ).ucWords()
                } );
              }
            }
            self.columnTypeList.event.list.findByProperty( 'key', undefined ).title =
              'Add an Event column...';
            self.columnTypeList.event.isLoading = false;
          } ),

          CnHttpFactory.instance( {
            path: 'event_type',
            data: {
              select: { column: [ 'id', 'name' ] },
              modifier: { order: ['name'] }
            }
          } ).query().then( function( response ) {
            response.data.forEach( function( item ) {
              self.columnSubtypeList.consent.push( { key: item.id.toString(), name: item.name } );
            } );
          } )

        ];

        /*
        promiseList.push(
          this.extendedSiteSelection ?
          CnHttpFactory.instance( {
            path: 'application',
            data: {
              select: {
                column: [
                  'id',
                  'name',
                  'title',
                  'release_based',
                  { table: 'application_type', column: 'name', alias: 'type' }
                ]
              },
              modifier: {
                join: [ {
                  table: 'application_type',
                  onleft: 'application_type.id',
                  onright: 'application.application_type_id'
                } ],
                order: ['application.title']
              }
            }
          } ).query().then( function( response ) {
            var sitePromiseList = [];
            response.data.forEach( function( item ) {
              if( item.release_based ) {
                self.applicationRestrictionTypeList.push( {
                  key: item.name + '_released',
                  application: item,
                  title: item.title + ' Released',
                  type: 'boolean',
                  enumList: [ { value: true, name: 'Yes' }, { value: false, name: 'No' } ],
                  required: true
                } );
              }

              if( 'mastodon' != item.type ) {
                var applicationRestriction = {
                  key: item.name + '_site',
                  application: item,
                  title: item.title + ' Site',
                  type: 'enum',
                  enumList: [ { value: '', name: '(empty)' } ]
                };
                self.applicationRestrictionTypeList.push( applicationRestriction );
                sitePromiseList.push(
                  CnHttpFactory.instance( {
                    path: 'application/' + item.id + '/site',
                    data: {
                      select: { column: [ 'id', 'name' ] },
                      modifier: { order: ['name'] }
                    }
                  } ).query().then( function( response ) {
                    response.data.forEach( function( site ) {
                      applicationRestriction.enumList.push( { value: site.id, name: site.name } );
                    } );
                  } )
                );
              }
            } );

            $q.all( sitePromiseList ).then( function() {
              self.applicationRestrictionTypeList.findByProperty( 'key', undefined ).title =
                'Add an application restriction...';
              //self.isLoading.applicationRestriction = false; TODO
            } );
          } ) :

        );
        */

        $q.all( promiseList );
      };

      return { instance: function( parentModel ) { return new object( parentModel ); } };
    }
  ] );

  /* ######################################################################################################## */
  cenozo.providers.factory( 'CnExportModelFactory', [
    'CnBaseModelFactory', 'CnExportAddFactory', 'CnExportListFactory', 'CnExportViewFactory',
    'CnHttpFactory', 'CnSession', '$q',
    function( CnBaseModelFactory, CnExportAddFactory, CnExportListFactory, CnExportViewFactory,
              CnHttpFactory, CnSession, $q ) {
      var object = function( root ) {
        var self = this;
        CnBaseModelFactory.construct( this, module );
        this.addModel = CnExportAddFactory.instance( this );
        this.listModel = CnExportListFactory.instance( this );
        this.viewModel = CnExportViewFactory.instance( this, root );
      };

      return {
        root: new object( true ),
        instance: function() { return new object( false ); }
      };
    }
  ] );

} );
