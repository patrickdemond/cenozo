<?php
/**
 * quota_add.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\ui\widget;
use cenozo\lib, cenozo\log;

/**
 * widget quota add
 */
class quota_add extends base_view
{
  /**
   * Constructor
   * 
   * Defines all variables which need to be set for the associated template.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param array $args An associative array of arguments to be processed by the widget
   * @access public
   */
  public function __construct( $args )
  {
    parent::__construct( 'quota', 'add', $args );
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
    
    // define all columns defining this record
    $this->add_item( 'site_id', 'enum', 'Site' );
    $this->add_item( 'region_id', 'enum', 'Region' );
    $this->add_item( 'gender', 'enum', 'Gender' );
    $this->add_item( 'age_group_id', 'enum', 'Age Group' );
    $this->add_item( 'population', 'number', 'Population' );
  }

  /**
   * Finish setting the variables in a widget.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access protected
   */
  protected function setup()
  {
    parent::setup();
    
    $site_class_name = lib::get_class_name( 'database\site' );
    $region_class_name = lib::get_class_name( 'database\region' );
    $quota_class_name = lib::get_class_name( 'database\quota' );
    $age_group_class_name = lib::get_class_name( 'database\age_group' );

    // create enum arrays
    $sites = array();
    $site_mod = lib::create( 'database\modifier' );
    $site_mod->order( 'service_id' );
    $site_mod->order( 'name' );
    foreach( $site_class_name::select( $site_mod ) as $db_site )
      $sites[$db_site->id] = $db_site->get_full_name();
    $regions = array();
    $region_mod = lib::create( 'database\modifier' );
    $region_mod->order( 'country' );
    $region_mod->order( 'name' );
    foreach( $region_class_name::select( $region_mod ) as $db_region )
      $regions[$db_region->id] = $db_region->name;
    $genders = $quota_class_name::get_enum_values( 'gender' );
    $genders = array_combine( $genders, $genders );
    $age_groups = array();
    foreach( $age_group_class_name::select() as $db_age_group )
      $age_groups[$db_age_group->id] = $db_age_group->to_string();

    // set the view's items
    $this->set_item( 'site_id', key( $sites ), true, $sites );
    $this->set_item( 'region_id', key( $regions ), true, $regions );
    $this->set_item( 'gender', key( $genders ), true, $genders );
    $this->set_item( 'age_group_id', key( $age_groups ), true, $age_groups );
    $this->set_item( 'population', 0, true );
  }
}