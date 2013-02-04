<?php
/**
 * participant_site_reassign.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\ui\widget;
use cenozo\lib, cenozo\log;

/**
 * widget participant site_reassign
 */
class participant_site_reassign extends \cenozo\ui\widget
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
    parent::__construct( 'participant', 'site_reassign', $args );
  }

  /**
   * Sets up necessary site-based variables.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access protected
   */
  protected function setup()
  {
    parent::setup();

    $site_class_name = lib::get_class_name( 'database\site' );
    $sites = array();
    $site_mod = lib::create( 'database\modifier' );
    $site_mod->order( 'service_id' );
    $site_mod->order( 'name' );
    foreach( $site_class_name::select( $site_mod ) as $db_site )
      $sites[] = array( 'id' => $db_site->id,
                        'name' => $db_site->get_full_name(),
                        'service' => $db_site->get_service()->name );
    $this->set_variable( 'sites', $sites );
  }
}
