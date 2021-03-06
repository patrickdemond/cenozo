<?php
/**
 * setting_manager.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo\business;
use cenozo\lib, cenozo\log;

/**
 * Manages software settings
 */
class setting_manager extends \cenozo\singleton
{
  /**
   * Constructor.
   * 
   * @throws exception\argument
   * @access protected
   */
  protected function __construct( $arguments )
  {
    $args = $arguments[0];
    $args = is_array( $arguments[0] ) ? $arguments[0] : array();

    // copy the setting one category at a time
    $this->read_settings( 'db', $args );
    $this->read_settings( 'general', $args );
    $this->read_settings( 'mail', $args );
    $this->read_settings( 'module', $args );
    $this->read_settings( 'ldap', $args );
    $this->read_settings( 'opal', $args );
    $this->read_settings( 'failover_opal', $args );
    $this->read_settings( 'path', $args );
    $this->read_settings( 'report', $args );
    $this->read_settings( 'url', $args );
    $this->read_settings( 'utility', $args );

    if( $this->setting_list['module']['voip'] ) $this->read_settings( 'voip', $args );

    if( $this->setting_list['module']['script'] )
    {
      $file = LIMESURVEY_PATH.'/application/config/config.php';
      if( file_exists( $file ) )
      {
        define( 'BASEPATH', '' ); // needed to read the config file
        $config = require( $file );
        $db = explode( ';', $config['components']['db']['connectionString'] );

        $parts = explode( ':', $db[0], 2 );
        $driver = current( $parts );
        $parts = explode( '=', $db[0], 2 );
        $server = next( $parts );
        $parts = explode( '=', $db[2], 2 );
        $database = next( $parts );

        $this->setting_list['survey_db'] =
          array( 'driver' => $driver,
                 'server' => $server,
                 'username' => $config['components']['db']['username'],
                 'password' => $config['components']['db']['password'],
                 'database' => $database,
                 'prefix' => $config['components']['db']['tablePrefix'] );
      }
      else
      {
        throw lib::create( 'exception\runtime',
          sprintf( 'Cannot find limesurvey config.php file (tried %s).', $file ),
          __METHOD__ );
      }
    }
  }

  /**
   * Read settings into the manager (should be called in the constructor only)
   * 
   * @param string $category The category the setting belongs to.
   * @param array $arguments The associative array containing all settings
   * @throws exception\argument
   * @access protected
   */
  protected function read_settings( $category, $arguments )
  {
    if( !array_key_exists( $category, $arguments ) )
      throw lib::create( 'exception\argument',
        'arguments['.$category.']', NULL, __METHOD__ );

    $this->setting_list[$category] = $arguments[$category];
  }

  /**
   * Get a setting's value
   * 
   * @param string $category The category the setting belongs to.
   * @param string $name The name of the setting.
   * @access public
   */
  public function get_setting( $category, $name )
  {
    // first check for the setting in static settings
    if( array_key_exists( $category, $this->setting_list ) &&
        array_key_exists( $name, $this->setting_list[$category] ) )
    {
      return $this->setting_list[$category][$name];
    }

    // if we get here then the setting doesn't exist
    log::error( "Tried getting value for setting [$category][$name] which doesn't exist." );

    return NULL;
  }

  /**
   * An array which holds static (non database) settings
   * @var array( mixed )
   * @access private
   */
  protected $setting_list = array();
}
