<?php
/**
 * module.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\service\access;
use cenozo\lib, cenozo\log;

/**
 * Performs operations which effect how this module is used in a service
 */
class module extends \cenozo\service\module
{
  /**
   * Extend parent method
   */
  public function validate()
  {
    $valid = parent::validate();

    if( $valid )
    {
      // access can only be listed in the context of a user, role or site
      $valid = in_array( $this->get_parent_subject(), array( 'user', 'role', 'site' ) );
    }

    return $valid;
  }

  /**
   * Extend parent method
   */
  public function prepare_read( $select, $modifier )
  {
    parent::prepare_read( $select, $modifier );

    // only include sites which belong to this application
    $modifier->join( 'site', 'access.site_id', 'site.id' );
    $modifier->where( 'site.application_id', '=', lib::create( 'business\session' )->get_application()->id );
  }
}