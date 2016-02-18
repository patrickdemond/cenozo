<?php
/**
 * base_access.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\database;
use cenozo\lib, cenozo\log;

/**
 * A base class for all classes joined together by the access table.
 */
abstract class base_access extends record
{
  /**
   * Get the number of related access-based records.
   * 
   * This method expands on the record magic call method by allowing access-based records
   * select their related lists.
   * For instance:
   *   user has get_role_<count|list>() and get_site_<count|list>()
   *   role has get_user_<count|list>() and get_site_<count|list>()
   *   site has get_user_<count|list>() and get_role_<count|list>()
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param database\modifier $modifier Modifications to the count.
   * @return int
   * @access public
   * @method int get_<record>_count() Returns the number of related access-based records.
   * @method int get_<record>_list() Returns an array of related access-based records.
   */
  public function __call( $name, $args )
  {
    $subject_name = static::get_table_name();

    // parse the function call name
    $name_parts = explode( '_', $name );
    $related_name = $name_parts[1];
    $action = 3 <= count( $name_parts ) ? $name_parts[2] : NULL;

    // make sure the method name is one which we want to process
    if( 3 != count( $name_parts ) ||
        'get' != $name_parts[0] ||
        ( 'user' != $related_name && 'role' != $related_name && 'site' != $related_name ) ||
        is_null( $action ) ||
        ( 'count' != $action && 'list' != $action ) ||
        $subject_name == $related_name )
    {
      return parent::__call( $name, $args );
    }

    // now that we are relatively sure the method name is valid, make sure we have a valid record
    if( is_null( $this->id ) )
    {
      log::warning( 'Tried to query user with no primary key.' );
      return 0;
    }

    // define the modifier
    $modifier = 1 == count( $args ) &&
                false !== strpos( get_class( $args[0] ), 'database\modifier' )
              ? $args[0]
              : lib::create( 'database\modifier' );

    $modifier->where( 'access.'.$subject_name.'_id', '=', $this->id );

    $class_name = lib::get_class_name( 'database\\'.$related_name );
    return 'list' == $action
           ? $class_name::select( $modifier )
           : $class_name::count( $modifier );
  }
}