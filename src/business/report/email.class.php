<?php
/**
 * email.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\business\report;
use cenozo\lib, cenozo\log;

/**
 * Mailout required report data.
 * 
 * @abstract
 */
class email extends \cenozo\business\report\base_report
{
  /**
   * Build the report
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access protected
   */
  protected function build()
  {
    $participant_class_name = lib::get_class_name( 'database\participant' );

    $select = lib::create( 'database\select' );
    $select->from( 'participant' );
    $select->add_table_column( 'language', 'name', 'Language' );
    $select->add_column( 'honorific', 'Honorific' );
    $select->add_column( 'first_name', 'First Name' );
    $select->add_column( 'other_name', 'Other Name' );
    $select->add_column( 'last_name', 'Last Name' );
    $select->add_column( 'IFNULL( email_old, "" )', 'Previous Email', false );
    $select->add_column( 'IFNULL( email, "" )', 'Email', false );
    $select->add_column(
      sprintf( 'IFNULL( %s, "" )', $this->get_datetime_column( 'email_datetime', 'date' ) ),
      'Date Changed',
      false );

    $modifier = lib::create( 'database\modifier' );
    $modifier->join( 'language', 'participant.language_id', 'language.id' );
    $modifier->where( 'email_datetime', '!=', NULL );

    // set up requirements
    $this->apply_restrictions( $modifier );

    $header = array();
    $content = array();
    $sql = sprintf( '%s %s', $select->get_sql(), $modifier->get_sql() );

    $this->add_table_from_select( NULL, $participant_class_name::select( $select, $modifier ) );
  }
}