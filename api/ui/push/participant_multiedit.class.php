<?php
/**
 * participant_multiedit.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\ui\push;
use cenozo\lib, cenozo\log;

/**
 * push: participant multiedit
 *
 * Edits multiple participants at once
 */
class participant_multiedit extends \cenozo\ui\push\base_participant_multi
{
  /**
   * Constructor.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param array $args Push arguments
   * @access public
   */
  public function __construct( $args )
  {
    parent::__construct( 'multiedit', $args );
  }

  /**
   * This method executes the operation's purpose.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access protected
   */
  protected function execute()
  {
    parent::execute();

    $participant_class_name = lib::get_class_name( 'database\participant' );

    $active = $this->get_argument( 'active' );
    $gender = $this->get_argument( 'gender' );
    $age_group_id = $this->get_argument( 'age_group_id' );
    $state_id = $this->get_argument( 'state_id' );
    $language_id = $this->get_argument( 'language_id' );
    $override_quota = $this->get_argument( 'override_quota' );
    $event_type_id = $this->get_argument( 'event_type_id' );

    $columns = array();
    if( 'dnc' != $active ) $columns['active'] = 'y' == $active;
    if( 'dnc' != $gender ) $columns['gender'] = $gender;
    if( 'dnc' != $age_group_id )
      $columns['age_group_id'] = 'NULL' == $age_group_id ? NULL : $age_group_id;
    if( 'dnc' != $state_id )
      $columns['state_id'] = 'NULL' == $state_id ? NULL : $state_id;
    if( 'dnc' != $language_id )
      $columns['language_id'] = 'NULL' == $language_id ? NULL : $language_id;
    if( 'dnc' != $override_quota ) $columns['override_quota'] = 'y' == $override_quota;
    
    // create events, if required
    if( 'dnc' != $event_type_id )
    {
      $sql = sprintf(
        'INSERT INTO event( create_timestamp, participant_id, event_type_id, datetime ) '.
        'SELECT NOW(), participant.id, %s, UTC_TIMESTAMP() '.
        'FROM participant %s',
        $event_type_id,
        $this->modifier->get_sql() );
      lib::create( 'business\session' )->get_database()->execute( $sql );
    }

    if( 'dnc' == $event_type_id || 0 < count( $columns ) )
    {
      if( 0 == count( $columns ) )
        throw lib::create( 'exception\notice',
          'Nothing to do since no information has been set to change.',
          __METHOD__ );
      $participant_class_name::multiedit( $this->modifier, $columns );
    }
  }
}
