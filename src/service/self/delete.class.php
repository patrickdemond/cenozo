<?php
/**
 * delete.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo\service\self;
use cenozo\lib, cenozo\log;

/**
 * Special service for handling the delete meta-resource (result)
 */
class delete extends \cenozo\service\service
{
  /**
   * Constructor
   * 
   * @param string $path The URL of the service (not including the base)
   * @param array $args An associative array of arguments to be processed by the delete operation.
   * @param string $file The raw file deleteed by the request
   * @access public
   */
  public function __construct( $path, $args, $file )
  {
    parent::__construct( 'DELETE', $path, $args, $file );
  }

  /**
   * Override parent method since self is a meta-resource
   */
  protected function create_resource( $index )
  {
    $session = lib::create( 'business\session' );
    return array( 'application' => $session->get_application()->get_column_values() );
  }

  /**
   * Override parent method since self is a meta-resource
   */
  protected function execute()
  {
    lib::create( 'business\session' )->logout();
    $this->status->set_code( 200 );
  }
}
