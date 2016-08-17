<?php
/**
 * user.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\database;
use cenozo\lib, cenozo\log;

/**
 * user: record
 */
class user extends record
{
  /**
   * Adds a list of sites to the user with the given role.
   * 
   * @author Patrick Emond <emondpd@mcamster.ca>
   * @param int $site_id_list The sites to add.
   * @param int $role_id The role to add them under.
   * @throws exeception\argument
   * @access public
   */
  public function add_access( $site_id_list, $role_id )
  {
    // make sure the site id list argument is a non-empty array of ids
    if( !is_array( $site_id_list ) || 0 == count( $site_id_list ) )
      throw lib::create( 'exception\argument', 'site_id_list', $site_id_list, __METHOD__ );

    // make sure the role id argument is valid
    if( 0 >= $role_id )
      throw lib::create( 'exception\argument', 'role_id', $role_id, __METHOD__ );

    $value_list = array();
    foreach( $site_id_list as $id )
      $value_list[] = sprintf( '(NULL, %s, %s, %s)',
                               static::db()->format_string( $id ),
                               static::db()->format_string( $role_id ),
                               static::db()->format_string( $this->id ) );

    static::db()->execute(
      sprintf( 'INSERT IGNORE INTO access (create_timestamp, site_id, role_id, user_id)'."\n".
               'VALUES %s',
               implode( ",\n       ", $values ) ) );
  }

  /**
   * Removes a list of sites to the user who have the given role.
   * 
   * @author Patrick Emond <emondpd@mcamster.ca>
   * @param int $access_id The access record to remove.
   * @access public
   */
  public function remove_access( $access_id )
  {
    if( is_null( $this->id ) )
    {
      log::warning( 'Tried to remove access from user with no primary key.' );
      return;
    }

    $db_access = lib::create( 'database\access', $access_id );
    $db_access->delete();
  }
}
