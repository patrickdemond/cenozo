<?php
/**
 * cenozo_application.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo\exception;
use cenozo\lib, cenozo\log;

/**
 * cenozo_application: cenozo application exceptions
 * 
 * This exception is used to duplicate an exception received from another cenozo application.
 */
class cenozo_application extends base_exception
{
  /**
   * Constructor
   * @param string|exception $message A message describing the exception or, if an exception,
                             the raw message from that exception will be used instead.
   * @param string|int $context The exceptions context, either a function name or error code.
   * @param exception $previous The previous exception used for the exception chaining.
   * @access public
   */
  public function __construct( $type, $code, $message, $previous = NULL )
  {
    parent::__construct( sprintf( '[%s] %s', $code, $message ), 0, $previous );
    $this->code = $code;
  }

  /**
   * Overrides the parent method since we are using another cenozo application's error codes.
   * @return int
   * @access public
   */
  public function get_number() { return 0; }

  /**
   * Overrides the parent method since we are using another cenozo application's error codes.
   * @return string
   * @access public
   */
  public function get_code()
  {
    return $this->code;
  }

  protected $code;
}
