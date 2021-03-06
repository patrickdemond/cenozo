<?php
/**
 * singleton.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo;

/**
 * singleton: a class that only allows for a single, static object
 * 
 * This is an object factory that creates singletons.  Any class that extends this base class can
 * be instantiated by calling the {@link self} method.  That method will return one and only
 * one instance per class.
 */
abstract class singleton
{
  /**
   * Get the singleton of the class.
   * 
   * Call this method to get a reference to the one and only static object for the current class.
   * The first time this method is called for each child class this method creates and stores an
   * instance of the singleton.
   * If the constructor of a singleton class requires arguments then pass them to this method,
   * if not then do not pass arguments (doing so will be caught by the child class' constructor
   * as a logic/fatal error).
   * @param mixed $arg1 used by the parent constructor, if needed
   * @param mixed $arg2 used by the parent constructor, if needed
   * @param mixed $arg3 used by the parent constructor, if needed, etc...
   * @return object
   * @access public
   */
  public static function self()
  {
    $class_index = lib::get_class_name( get_called_class(), true );

    // if any arguments were passed to this method, pass them on to the contructor
    if( !self::exists() )
      self::$instance_list[$class_index] = 0 < func_num_args() ?
        self::$instance_list[$class_index] = new static( func_get_args() ) :
        self::$instance_list[$class_index] = new static();

    return self::$instance_list[$class_index];
  }

  public static function exists()
  {
    $class_index = lib::get_class_name( get_called_class(), true );
    return isset( self::$instance_list[$class_index] );
  }

  /**
   * The static array of all singletons.
   * @var mixed
   * @access private
   */
  private static $instance_list = array();
}
