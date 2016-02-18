<?php
/**
 * module.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\service;
use cenozo\lib, cenozo\log;

/**
 * Performs operations which effect how this module is used in a service
 */
abstract class module extends \cenozo\base_object
{
  /**
   * TODO: document
   */
  public function __construct( $index, $service )
  {
    $this->index = $index;
    $this->service = $service;
  }

  /**
   * Prepares the read parameters for the parent service
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\select The select used by the read service
   * @param database\modifier The modifier used by the read service
   * @access public
   */
  public function prepare_read( $select, $modifier ) {}

  /**
   * Performs operations on all rows after reading
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access public
   */
  public function post_read( &$row ) {}

  /**
   * Performs operations on the leaf record before writing
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\record The leaf record being written to
   * @access public
   */
  public function pre_write( $record ) {}

  /**
   * Performs operations on the leaf record after writing
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\record The leaf record being written to
   * @access public
   */
  public function post_write( $record ) {}

  /**
   * Validates the use of a module for its parent service
   * 
   * This method should be extended whenever checking for the validity of the service.
   * When invalid the module should set the status code to something appropriate (ex: 403, 404, etc)
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @return boolean
   * @access public
   */
  public function validate() {}

  /**
   * Returns whether this is the leaf module (has no children)
   */
  protected function is_leaf_module()
  {
    return $this->get_subject() == $this->service->get_leaf_subject();
  }

  /**
   * Returns the method of the parent service
   */
  protected function get_method()
  {
    return $this->service->get_method();
  }

  /**
   * Returns this module's subject
   */
  protected function get_subject()
  {
    return $this->service->get_subject( $this->index );
  }

  /**
   * Returns the parent module's (collection's) subject
   */
  protected function get_parent_subject()
  {
    return $this->service->get_subject( $this->index - 1 );
  }

  /**
   * TODO: document
   */
  protected function get_resource()
  {
    return $this->service->get_resource( $this->index );
  }

  /**
   * TODO: document
   */
  protected function get_parent_resource()
  {
    return $this->service->get_resource( $this->index - 1 );
  }

  /**
   * TODO: document
   */
  protected function set_data( $data )
  {
    $this->service->set_data( $data );
  }

  /**
   * TODO: document
   */
  protected function get_status()
  {
    return $this->service->get_status();
  }

  /**
   * TODO: document
   */
  public function get_file_as_raw()
  {
    return $this->service->get_file_as_raw();
  }

  /**
   * TODO: document
   */
  public function get_file_as_object()
  {
    return $this->service->get_file_as_object();
  }

  /**
   * TODO: document
   */
  public function get_file_as_array()
  {
    return $this->service->get_file_as_array();
  }

  /**
   * TODO: document
   */
  protected function get_argument( $name, $default = NULL )
  {
    return 1 == func_num_args() ?
      $this->service->get_argument( $name ) :
      $this->service->get_argument( $name, $default );
  }

  /**
   * TODO: document
   */
  private $index = NULL;

  /**
   * TODO: document
   */
  private $service = NULL;
}