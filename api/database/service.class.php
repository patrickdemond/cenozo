<?php
/**
 * service.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\database;
use cenozo\lib, cenozo\log;

/**
 * service: record
 */
class service extends record
{
  /**
   * Extend parent method by restricting selection to records belonging to this service only
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\modifier $modifier Modifications to the selection.
   * @param boolean $count If true the total number of records instead of a list
   * @param boolean $full If true then records will not be restricted by service
   * @access public
   * @static
   */
  public static function select( $modifier = NULL, $count = false, $full = false )
  {
    if( !$full )
    {
      // make sure to only include services belonging to this application
      if( is_null( $modifier ) ) $modifier = lib::create( 'database\modifier' );
      $modifier->where( 'id', '=', lib::create( 'business\session' )->get_service()->id );
    }

    return parent::select( $modifier, $count );
  } 
    
  /**
   * Make sure to only include cohorts which this service has access to.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\modifier $modifier Modifications to the list.
   * @return array( database\cohort )
   * @access public
   */
  protected function get_record_list(
    $record_type, $modifier = NULL, $inverted = false, $count = false )
  {
    if( 'cohort' == $record_type )
    {
      if( is_null( $modifier ) ) $modifier = lib::create( 'database\modifier' );
      $modifier->where( 'service_has_cohort.service_id', '=',
                        lib::create( 'business\session' )->get_service()->id );
    }
    return parent::get_record_list( $record_type, $modifier, $inverted, $count );
  }

  /**
   * Adds one or more cohorts so a service.
   * This method effectively overrides the parent add_records() method so that grouping can also
   * be included.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param int|array(int) $cohort_ids A single or array of cohort ids
   * @param string $grouping How to group participants to determine their default site.
   * @access public
   */
  public function add_cohort( $cohort_ids, $grouping )
  {
    parent::add_cohort( $cohort_ids );

    // do nothing if the service has no primary key
    if( is_null( $this->id ) ) return;

    $database_class_name = lib::get_class_name( 'database\database' );

    // cohort_ids may be a single integer, make sure it is an array
    if( !is_array( $cohort_ids ) ) $cohort_ids = array( $cohort_ids );

    database::$debug = true;
    static::db()->execute( sprintf(
      'UPDATE service_has_cohort '.
      'SET grouping = %s '.
      'WHERE service_id = %s '.
      'AND cohort_id IN ( %s )',
      $database_class_name::format_string( $grouping ),
      $database_class_name::format_string( $this->id ),
      $database_class_name::format_string( implode( ',', $cohort_ids ) ) ) );
    database::$debug = false;
  }

  /**
   * Returns the url for this service as defined in the local settings file
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access public
   */
  public function get_url()
  {
    // the url will be in a define: <SERVICE_NAME>_URL
    $constant_name = sprintf( '%s_URL', strtoupper( $this->name ) );
    if( !defined( $constant_name ) )
      throw lib::create( 'exception\runtime', sprintf(
        'Tried to get url for service "%s" but setting ["url"]["%s"] is missing.',
        $this->name,
        strtoupper( $this->name ) ) );

    return constant( $constant_name );
  }

  /**
   * Returns the type of grouping that this service has for a particular cohort.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\cohort $db_cohort
   * @return string
   * @access public
   */
  public function get_cohort_grouping( $db_cohort )
  {
    if( is_null( $this->id ) )
    {
      log::warning( 'Tried to get cohort gropuing for service with no id.' );
      return '';
    }

    return static::db()->get_one( sprintf(
      'SELECT grouping FROM service_has_cohort WHERE service_id = %s AND cohort_id = %s',
      $this->id,
      $db_cohort->id ) );
  }

  /**
   * Returns an array of all grouping types (from the service_has_cohort.grouping column).
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $column_name A column name in the record's corresponding table.
   * @return array( string )
   * @access public
   * @static
   */
  public static function get_grouping_types()
  {
    $type = static::db()->get_column_type( 'service_has_cohort', 'grouping' );
    preg_match_all( "/'[^']+'/", $type, $matches );
    $values = array();
    foreach( current( $matches ) as $match ) $values[] = substr( $match, 1, -1 );

    return $values;
  }
}