<?php
/**
 * query.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo\service\token;
use cenozo\lib, cenozo\log;

class query extends \cenozo\service\query
{
  /**
   * Override parent method
   */
  public function __construct( $path, $args = NULL, $file = NULL )
  {
    parent::__construct( $path, $args, $file );

    // token is a special case (because it is a limesurvey table)
    $this->status->set_code( 404 );
  }
}
