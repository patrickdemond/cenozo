<?php
/**
 * module.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo\service\writelog;
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

    if( 300 > $this->get_status()->get_code() )
    {
      // restrict by site
      $db_restrict_site = $this->get_restricted_site();
      if( !is_null( $db_restrict_site ) )
      {
        $record = $this->get_resource();
        if( $record && $record->site_id != $db_restrict_site->id ) $this->get_status()->set_code( 403 );
      }
    }
  }

  /**
   * Extend parent method
   */
  public function prepare_read( $select, $modifier )
  {
    parent::prepare_read( $select, $modifier );

    // restrict by site
    $db_restrict_site = $this->get_restricted_site();
    if( !is_null( $db_restrict_site ) )
      $modifier->where( 'writelog.site_id', '=', $db_restrict_site->id );

    // add the completed column based on the status
    if( $select->has_column( 'elapsed' ) ) $select->add_column( 'status < 300', 'completed' );
  }
}
