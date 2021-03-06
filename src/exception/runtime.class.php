<?php
/**
 * runtime.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo\exception;
use cenozo\lib, cenozo\log;

/**
 * runtime: runtime exceptions
 * 
 * All generic exceptions which only occur at runtime use this class to throw exceptions.
 */
class runtime extends base_exception
{
  /**
   * Constructor
   * @param string $message A message describing the exception.
   * @param string|int $context The exceptions context, either a function name or error code.
   * @param exception $previous The previous exception used for the exception chaining.
   * @access public
   */
  public function __construct( $message, $context, $previous = NULL )
  {
    parent::__construct( $message, $context, $previous );
  }
}
