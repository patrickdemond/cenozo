<?php
/**
 * module.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\service\system_message;
use cenozo\lib, cenozo\log;

/**
 * Performs operations which effect how this module is used in a service
 */
class module extends \cenozo\service\site_restricted_module
{
  /**
   * Extend parent method
   */
  public function validate()
  {
    parent::validate();

    // restrict by site
    $db_restrict_site = $this->get_restricted_site();
    if( !is_null( $db_restrict_site ) )
    {
      $record = $this->get_resource();
      if( $record && !is_null( $record->site_id ) && $record->site_id != $db_restrict_site->id )
        $this->get_status()->set_code( 403 );
    }
  }

  /**
   * Extend parent method
   */
  public function prepare_read( $select, $modifier )
  {
    parent::prepare_read( $select, $modifier );

    $session = lib::create( 'business\session' );
    $db_application = $session->get_application();
    $db_role = $session->get_role();

    // left join to application, site and role since they may be null
    $modifier->left_join( 'application', 'system_message.application_id', 'application.id' );
    $modifier->left_join( 'site', 'system_message.site_id', 'site.id' );
    $modifier->left_join( 'role', 'system_message.role_id', 'role.id' );

    $application_id = $db_application->id;
    $column = sprintf( 'IFNULL( system_message.application_id, %d )', $application_id );
    $modifier->where( $column, '=', $application_id );

    // restrict by site
    $db_restrict_site = $this->get_restricted_site();
    if( !is_null( $db_restrict_site ) )
    {
      $column = sprintf( 'IFNULL( system_message.site_id, %d )', $db_restrict_site->id );
      $modifier->where( $column, '=', $db_restrict_site->id );
    }

    $modifier->where( 'IFNULL( role.tier, 1 )', '<=', $db_role->tier );
  }
}