<?php
/**
 * withdraw_mailout.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo\business\report;
use cenozo\lib, cenozo\log;

/**
 * Email report
 */
class withdraw_mailout extends \cenozo\business\report\base_report
{
  /**
   * Build the report
   * @access protected
   */
  protected function build()
  {
    $participant_class_name = lib::get_class_name( 'database\participant' );
    $consent_type_class_name = lib::get_class_name( 'database\consent_type' );
    $hold_type_class_name = lib::get_class_name( 'database\hold_type' );
    $survey_manager = lib::create( 'business\survey_manager' );
    $setting_manager = lib::create( 'business\setting_manager' );
    $withdraw_option_and_delink = $setting_manager->get_setting( 'general', 'withdraw_option_and_delink' );

    $db_participation_consent_type = $consent_type_class_name::get_unique_record( 'name', 'participation' );
    $db_withdrawn_3rd_party_hold_type = $hold_type_class_name::get_unique_record(
      array( 'type', 'name' ),
      array( 'final', 'Withdrawn by 3rd party' )
    );

    $select = lib::create( 'database\select' );
    $select->from( 'participant' );
    $select->add_column( 'IF( hold.id IS NULL, "no", "yes" )', '3rd Party', false );
    $select->add_column( 'language.name', 'Language', false );
    $select->add_column( 'uid', 'UID' );
    $select->add_column( 'honorific', 'Honorific' );
    $select->add_column( 'first_name', 'First Name' );
    $select->add_column( 'last_name', 'Last Name' );
    $select->add_column( 'address.address1', 'Address1', false );
    $select->add_column( 'address.address2', 'Address2', false );
    $select->add_column( 'address.city', 'City', false );
    $select->add_column( 'region.abbreviation', 'Province/State', false );
    $select->add_column( 'address.postcode', 'Postcode', false );
    $select->add_column( 'region.country', 'Country', false );
    $select->add_column( 'IF( survey.submitdate IS NULL, "no", "yes" )', 'Script', false );

    $modifier = lib::create( 'database\modifier' );
    $modifier->order( 'IF( hold.id IS NULL, "no", "yes" )' );
    $modifier->order( 'uid' );
    $modifier->join( 'language', 'participant.language_id', 'language.id' );
    $modifier->join( 'participant_first_address', 'participant.id', 'participant_first_address.participant_id' );
    $modifier->join( 'address', 'participant_first_address.address_id', 'address.id' );
    $modifier->join( 'region', 'address.region_id', 'region.id' );
    $modifier->where( 'exclusion_id', '=', NULL );

    // make sure the current consent is negative or the participant has been withdrawn by a 3rd party
    $join_mod = lib::create( 'database\modifier' );
    $join_mod->where( 'participant.id', '=', 'participant_last_consent.participant_id', false );
    $join_mod->where( 'participant_last_consent.consent_type_id', '=', $db_participation_consent_type->id );
    $modifier->join_modifier( 'participant_last_consent', $join_mod );
    $modifier->left_join( 'consent', 'participant_last_consent.consent_id', 'consent.id' );

    $modifier->join( 'participant_last_hold', 'participant.id', 'participant_last_hold.participant_id' );
    $join_mod = lib::create( 'database\modifier' );
    $join_mod->where( 'participant_last_hold.hold_id', '=', 'hold.id', false );
    $join_mod->where( 'hold.hold_type_id', '=', $db_withdrawn_3rd_party_hold_type->id );
    $modifier->join_modifier( 'hold', $join_mod, 'left' );

    $modifier->where_bracket( true );
    $modifier->where( 'IFNULL( consent.accept, true )', '=', false );
    $modifier->or_where( 'hold.id', '!=', NULL );
    $modifier->where_bracket( false );

    $modifier->join(
      'participant_last_event',
      'participant.id',
      'participant_last_mailed_event.participant_id',
      '',
      'participant_last_mailed_event'
    );
    $modifier->join(
      'event_type',
      'participant_last_mailed_event.event_type_id',
      'mailed_event_type.id',
      '',
      'mailed_event_type'
    );
    $modifier->left_join(
      'event',
      'participant_last_mailed_event.event_id',
      'mailed_event.id',
      'mailed_event'
    );
    $modifier->where( 'mailed_event_type.name', '=', 'withdraw mailed' );

    $modifier->join(
      'participant_last_event',
      'participant.id',
      'participant_last_not_mailed_event.participant_id',
      '',
      'participant_last_not_mailed_event'
    );
    $modifier->left_join(
      'event',
      'participant_last_not_mailed_event.event_id',
      'not_mailed_event.id',
      'not_mailed_event'
    );
    $modifier->join(
      'event_type',
      'participant_last_not_mailed_event.event_type_id',
      'not_mailed_event_type.id',
      '',
      'not_mailed_event_type'
    );
    $modifier->where( 'not_mailed_event_type.name', '=', 'withdraw not mailed' );

    // make sure they haven't been mailed to already
    $modifier->where_bracket( true );
    $modifier->where( 'mailed_event.id', '=', NULL );
    $modifier->or_where( 'mailed_event.datetime', '<', 'consent.datetime', false );
    $modifier->where_bracket( false );
    $modifier->where_bracket( true );
    $modifier->where( 'not_mailed_event.id', '=', NULL );
    $modifier->or_where( 'not_mailed_event.datetime', '<', 'consent.datetime', false );
    $modifier->where_bracket( false );

    // add the special withdraw option column using a left join
    if( $withdraw_option_and_delink )
      $survey_manager->add_withdraw_option_column( $select, $modifier, 'Option', false, true );

    // add the hin and samples withdraw option columns
    $select->add_column( '0 < tokens.attribute_1', 'hin', false );
    $select->add_column( '0 < tokens.attribute_2', 'sample', false );

    // set up requirements
    $this->apply_restrictions( $modifier );

    $this->add_table_from_select( NULL, $participant_class_name::select( $select, $modifier ) );
  }
}
