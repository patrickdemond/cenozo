<?php
/**
 * user_list.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\ui\widget;
use cenozo\lib, cenozo\log;

/**
 * widget user list
 */
class user_list extends site_restricted_list
{
  /**
   * Constructor
   * 
   * Defines all variables required by the user list.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param array $args An associative array of arguments to be processed by the widget
   * @access public
   */
  public function __construct( $args )
  {
    parent::__construct( 'user', $args );
  }

  /**
   * Processes arguments, preparing them for the operation.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @throws exception\notice
   * @access protected
   */
  protected function prepare()
  {
    parent::prepare();

    $this->add_column( 'name', 'string', 'Username', true );
    $this->add_column( 'first_name', 'string', 'First Name', true );
    $this->add_column( 'last_name', 'string', 'Last Name', true );
    $this->add_column( 'active', 'boolean', 'Active', true );
    $this->add_column( 'site.name', 'string', 'Site', false );
    $this->add_column( 'role.name', 'string', 'Role', false );
    $this->add_column( 'last_activity', 'fuzzy', 'Last activity', false );
  }

  /**
   * Defines all rows in the list.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access protected
   */
  protected function setup()
  {
    parent::setup();
    
    foreach( $this->get_record_list() as $record )
    {
      // determine the role
      $modifier = lib::create( 'database\modifier' );
      if( !is_null( $this->db_restrict_site ) )
        $modifier->where( 'access.site_id', '=', $this->db_restrict_site->id );

      $site = 'none';
      $db_sites = $record->get_site_list();
      if( 1 == count( $db_sites ) ) $site = $db_sites[0]->get_full_name(); // only one site?
      else if( 1 < count( $db_sites ) ) $site = 'multiple'; // multiple sites?
      
      $role = 'none';
      $db_roles = $record->get_role_list( $modifier );
      if( 1 == count( $db_roles ) ) $role = $db_roles[0]->name; // only one role?
      else if( 1 < count( $db_roles ) ) $role = 'multiple'; // multiple roles?
      
      // determine the last activity
      $db_activity = $record->get_last_activity();
      $last = is_null( $db_activity ) ? null : $db_activity->datetime;

      // assemble the row for this record
      $this->add_row( $record->id,
        array( 'name' => $record->name,
               'first_name' => $record->first_name,
               'last_name' => $record->last_name,
               'active' => $record->active,
               'site.name' => $site,
               'role.name' => $role,
               'last_activity' => $last ) );
    }
  }
  
  /**
   * Overrides the parent class method since the record count depends on the site restriction
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\modifier $modifier Modifications to the list.
   * @return int
   * @access protected
   */
  public function determine_record_count( $modifier = NULL )
  {
    // only include users who have access to a site and role belonging to this application
    $db_application = lib::create( 'business\session' )->get_application();
    if( NULL == $modifier ) $modifier = lib::create( 'database\modifier' );
    $modifier->join( 'access', 'user.id', 'access.user_id' );
    $modifier->join( 'site', 'access.site_id', 'site.id' );
    $modifier->where( 'site.application_id', '=', $db_application->id );
    $modifier->join( 'application_has_role', 'access.role_id', 'application_has_role.role_id' );
    $modifier->where( 'application_has_role.application_id', '=', $db_application->id );

    if( !is_null( $this->db_restrict_site ) )
      $modifier->where( 'access.site_id', '=', $this->db_restrict_site->id );

    // skip the parent method
    $grand_parent = get_parent_class( get_parent_class( get_class() ) );
    return $grand_parent::determine_record_count( $modifier );
  }
  
  /**
   * Overrides the parent class method since the record count depends on the site restriction
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\modifier $modifier Modifications to the list.
   * @return array( record )
   * @access protected
   */
  public function determine_record_list( $modifier = NULL )
  {
    // only include users who have access to a site and role belonging to this application
    $db_application = lib::create( 'business\session' )->get_application();
    if( NULL == $modifier ) $modifier = lib::create( 'database\modifier' );
    $modifier->join( 'access', 'user.id', 'access.user_id' );
    $modifier->join( 'site', 'access.site_id', 'site.id' );
    $modifier->where( 'site.application_id', '=', $db_application->id );
    $modifier->join( 'application_has_role', 'access.role_id', 'application_has_role.role_id' );
    $modifier->where( 'application_has_role.application_id', '=', $db_application->id );

    if( !is_null( $this->db_restrict_site ) )
      $modifier->where( 'access.site_id', '=', $this->db_restrict_site->id );

    // skip the parent method
    $grand_parent = get_parent_class( get_parent_class( get_class() ) );
    return $grand_parent::determine_record_list( $modifier );
  }
}
