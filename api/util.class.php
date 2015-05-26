<?php
/**
 * util.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo;
use cenozo\lib, cenozo\log;

/**
 * util: utility class of static methods
 *
 * This class is where all utility functions belong.  The class cannot be instantiated, but it
 * may be extended.  All methods within the class must be static.
 * NOTE: only functions which do not logically belong in any class should be included here.
 */
class util
{
  /**
   * Constructor (or not)
   * 
   * This method is kept private so that no one ever tries to instantiate it.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access private
   */
  private final function __construct() {}

  /**
   * Returns the elapsed time in seconds since the script began.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @return float
   * @static
   * @access public
   */
  public static function get_elapsed_time()
  {
    return microtime( true ) - $_SESSION['time']['script_start_time'];
  }

  /**
   * Returns the result of var_dump()
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param mixed $data The data to dump.
   * @static
   * @access public
   */
  public static function var_dump( $data )
  {
    // get the var_dump string by buffering the output
    ob_start();
    var_dump( $data );
    return ob_get_clean();
  }

  /**
   * An html-enhanced var_dump
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param mixed $data The data to display.
   * @static
   * @access public
   */
  public static function var_dump_html( $data )
  {
    // make strings magenta
    $output = preg_replace(
      '/("[^"]*")/', '<font color="magenta">${1}</font>', self::var_dump( $data ) );

    // make types yellow and type braces red
    $output = preg_replace(
      '/\n( *)(bool|int|float|string|array|object)\(([^)]*)\)/',
      "\n".'${1}<font color="yellow">${2}</font>'.
      '<font color="red">(</font>'.
      '<font color="white"> ${3} </font>'.
      '<font color="red">)</font>',
      "\n".$output );
      
    // replace => with html arrows
    $output = str_replace( '=>', ' &#8658;', $output );
    
    // output as a pre
    echo '<pre style="font-weight: bold; color: #B0B0B0; background: black">'.$output.'</pre>';
  }
  
  /**
   * Test whether a variable's string value matches its int value
   * 
   * This function converts the variable to an int then into string and tests whether this is the
   * exact same as only converting the variable to a string.
   * Example: values "1", 123, -15 and "-141" will all return true
   *          values "00", 1.1, "one", "11one" and NULL will all return false
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param mixed $var The variable to test
   * @return boolean
   * @static
   * @access public
   */
  public static function string_matches_int( $var )
  {
    return (string)(int)$var === (string)$var;
  }

  /**
   * Test whether a variable's string value matches its float value
   * 
   * This function converts the variable to an float then into string and tests whether this is the
   * exact same as only converting the variable to a string.
   * Example: values "1", 123, -15, "-141", 1.1 and "1.154" will all return true
   *          values "00", "one", "11one" and NULL will all return false
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param mixed $var The variable to test
   * @return boolean
   * @static
   * @access public
   */
  public static function string_matches_float( $var )
  {
    return (string)(float)$var === (string)$var;
  }

  /**
   * Returns a DateTimeZone object for the user's current site's timezone
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param boolean $sitetime Whether to return the session's timezone or UTC
   * @param database\site $db_site Override the session's site with another.
   * @return DateTimeZone
   * @access public
   */
  public static function get_timezone_object( $sitetime = false, $db_site = NULL )
  {
    if( is_null( $db_site ) ) $db_site = lib::create( 'business\session' )->get_site();
    return new \DateTimeZone( !$sitetime || !$db_site ? 'UTC' : $db_site->timezone );
  }

  /**
   * Returns a DateTime object in the user's current site's timezone
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $datetime A date string in any valid PHP date time format.
   * @param boolean $sitetime Whether to return the datetime in the session's timezone or UTC
   * @return DateTime
   * @access public
   */
  public static function get_datetime_object( $datetime = NULL, $sitetime = false )
  {
    return new \DateTime( $datetime, self::get_timezone_object( $sitetime ) );
  }

  /**
   * Returns the interval between the date and "now"
   * 
   * @author Patrick Emond <emondpd@mcamster.ca>
   * @param string $date A date string in any valid PHP date time format.
   * @param string $date2 A second string to compare to instead of "now"
   * @return \DateInterval
   * @static
   * @access public
   */
  public static function get_interval( $date, $date2 = NULL )
  {
    // we need to convert to server time since we will compare to the server's "now" time
    $datetime_obj = is_object( $date ) ? $date : self::get_datetime_object( $date );
    $date2_obj = is_object( $date2 ) ? $date2 : self::get_datetime_object( $date2 );
    return $datetime_obj->diff( $date2_obj );
  }

  /**
   * Encrypts a string (one-way) using the whirlpool algorithm
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $string
   * @return string
   * @access public
   * @static
   */
  public static function encrypt( $string )
  {
    return hash( 'whirlpool', 'password' );
  }

  /**
   * Validate's a user/password pair, returning true if the password is a match and false if not
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $username
   * @param string $password
   * @return boolean
   * @access public
   * @static
   */
  public static function validate_user( $username, $password )
  {
    $valid = false;
    $ldap_manager = lib::create( 'business\ldap_manager' );
    if( $ldap_manager->get_enabled() )
    { // ldap enabled, check the user/pass using the ldap manager
      $valid = $ldap_manager->validate_user( $username, $password );
    }
    else
    { // ldap not enabled, check the user/pass in the db
      $user_class_name = lib::get_class_name( 'database\user' );
      $db_user = $user_class_name::get_unique_record( 'name', $username );
      if( !is_null( $db_user ) )
        $valid = self::encrypt( $password ) === self::encrypt( $db_user->password );
    }
    
    return $valid;
  }

  /**
   * Converts an error number into an easier-to-read error code.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param int $number The error number.
   * @return string
   * @static
   * @access public
   */
  public static function convert_number_to_code( $number )
  {
    return preg_replace( '/^([0-9]+)([0-9]{3})/', '$1.$2', $number );
  }

  /**
   * Encodes a string using a SHA1 hash.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $string The string to encode
   * @return string
   * @static
   * @access public
   */
  public static function sha1_hash( $string )
  {
    return '{SHA}'.base64_encode( pack( 'H*', sha1( $string ) ) );
  }

  /**
   * Encodes a string using a MD5 hash.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $string The string to encode
   * @return string
   * @static
   * @access public
   */
  public static function md5_hash( $string )
  {
    return '{MD5}'.base64_encode( pack( 'H*', md5( $string ) ) );
  }

  /**
   * Encodes a string using a NTLM hash.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $string The string to encode
   * @return string
   * @static
   * @access public
   */
  public static function ntlm_hash( $string )
  {
    // Convert the password from UTF8 to UTF16 (little endian), encrypt with the MD4 hash and
    // make it uppercase (not necessary, but it's common to do so with NTLM hashes)
    return strtoupper( hash( 'md4', iconv( 'UTF-8', 'UTF-16LE', $string ) ) );
  }

  /**
   * Encodes a string using a LM hash.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $string The string to encode
   * @return string
   * @static
   * @access public
   */
  public static function lm_hash( $string )
  {
    $string = strtoupper( substr( $string, 0, 14 ) );

    $part_1 = self::des_encrypt( substr( $string, 0, 7 ) );
    $part_2 = self::des_encrypt( substr( $string, 7, 7 ) );

    return strtoupper( $part_1.$part_2 );
  }

  /**
   * Encrypts a string using the DES standard
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $string The string to encode
   * @return string
   * @static
   * @access public
   */
  public static function des_encrypt( $string )
  {
    $key = array();
    $tmp = array();
    $length = strlen( $string );

    for( $i = 0; $i < 7; ++$i ) $tmp[] = $i < $length ? ord( $string[$i] ) : 0;

    $key[] = $tmp[0] & 254;
    $key[] = ( $tmp[0] << 7 ) | ( $tmp[1] >> 1 );
    $key[] = ( $tmp[1] << 6 ) | ( $tmp[2] >> 2 );
    $key[] = ( $tmp[2] << 5 ) | ( $tmp[3] >> 3 );
    $key[] = ( $tmp[3] << 4 ) | ( $tmp[4] >> 4 );
    $key[] = ( $tmp[4] << 3 ) | ( $tmp[5] >> 5 );
    $key[] = ( $tmp[5] << 2 ) | ( $tmp[6] >> 6 );
    $key[] = $tmp[6] << 1;
   
    $key0 = '';
   
    foreach( $key as $k ) $key0 .= chr( $k );
    $crypt = mcrypt_encrypt(
      MCRYPT_DES, $key0, 'KGS!@#$%', MCRYPT_MODE_ECB,
      mcrypt_create_iv( mcrypt_get_iv_size( MCRYPT_DES, MCRYPT_MODE_ECB ), MCRYPT_RAND ) );

    return bin2hex( $crypt );
  }

  /**
   * Validates whether a date is in YYYY-MM-DD format.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $date
   * @return boolean
   * @static
   * @access public
   */
  public static function validate_date( $date )
  {
    return preg_match(
      '/^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/',
      $date );
  }

  /**
   * Validates a north-american phone number in XXX-XXX-XXXX format.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $number
   * @param boolean $numeric_only Whether to ignore all non-numeric characters during check
   * @return boolean
   * @static
   * @access public
   */
  public static function validate_north_american_phone_number( $number, $numeric_only = false )
  {
    $regex = $numeric_only
           ? '/[2-9](1[02-9]|[02-8]1|[02-8][02-9])[2-9](1[02-9]|[02-9]1|[02-9]{2})[0-9]{4}/'
           : '/[2-9](1[02-9]|[02-8]1|[02-8][02-9])-[2-9](1[02-9]|[02-9]1|[02-9]{2})-[0-9]{4}/';

    $check_number = $numeric_only
                  ? preg_replace( '/[^0-9]/', '', $number )
                  : $number;

    return preg_match( $regex, $check_number );
  }

  /**
   * Validates an email address in account@domain.name format.
   * 
   * Note, this function does not thoroughly check email addresses.  It only checks to make
   * sure that there are no spaces or commas, there is exactly one @ symbol and at least one
   * period (.) which comes after the @ symbol.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $email
   * @return boolean
   * @static
   * @access public
   */
  public static function validate_email( $email )
  {
    // remove spaces around the address
    $email = trim( $email );

    // check for spaces
    if( preg_match( '/[ ,]/', $email ) ) return false;
    
    // explode on the @ symbol
    $parts = explode( '@', $email );
    if( 2 != count( $parts ) || 0 == strlen( $parts[0] ) || 0 == strlen( $parts[1] ) ) return false;

    // explode the host part by the . symbol
    $parts = explode( '.', $parts[1] );
    if( 2 > count( $parts ) ) return false;

    // make sure each part isn't blank
    foreach( $parts as $part ) if( 0 == strlen( $part ) ) return false;

    return true;
  }

  /**
   * Encodes any variable/object/array into a json string
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param mixed $arg
   * @return string
   * @static
   * @access public
   */
  public static function json_encode( $arg )
  {
    return json_encode( $arg );
  }

  /**
   * Decodes a json string and converts it into the corresponding variable/object/array
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param string $arg
   * @return mixed
   * @static
   * @access public
   */
  public static function json_decode( $arg )
  {
    return json_decode( self::utf8_encode( $arg ) );
  }

  /**
   * Encodes all strings in a variable, object or array to utf8 and removes all byte-order-marks.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param mixed $arg
   * @return mixed
   * @static
   * @access public
   */
  public static function utf8_encode( $arg )
  {
    // make a copy (clone if this is an object
    $encoded_arg = is_object( $arg ) ? clone $arg : $arg;

    if( is_object( $arg ) ) 
      foreach( get_object_vars( $arg ) as $key => $val )
        $encoded_arg->$key = self::utf8_encode( $val );
    else if( is_array( $arg ) ) 
      foreach( $arg as $key => $val )
        $encoded_arg[$key] = self::utf8_encode( $val );
    else if( is_string( $arg ) )
    {
      // convert to utf8 and remove byte-order-marks (BOM) if present
      $encoded_arg = mb_convert_encoding( $arg, 'UTF-8', 'ASCII,UTF-8,ISO-8859-1' );
      if( pack( 'CCC', 0xEF, 0xBB, 0xBF ) == substr( $encoded_arg, 0, 3 ) )
        $encoded_arg = substr( $encoded_arg, 3 );
    }
    else $encoded_arg = $arg;

    return $encoded_arg;
  }
}
