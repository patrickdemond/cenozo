<?php
/**
 * consent.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 */

namespace cenozo\database;
use cenozo\lib, cenozo\log;

/**
 * consent: record
 */
class consent extends record
{
  /**
   * Overrides the parent save method.
   * 
   * Depending on the consent-type of the affected consent record we may need to let *tooth applications know
   * the operation is complete.
   */
  public function save()
  {
    $db_participant = $this->get_participant();
    $new_record = is_null( $this->id );

    $db_consent_type = $this->get_consent_type();

    // get the most recent consent BEFORE updating the record
    $db_last_consent = $db_participant->get_last_consent( $db_consent_type );
    $old_accept = is_null( $db_last_consent ) ? 'none' : $db_last_consent->accept;

    // change to accept column or no effective qnaire means we don't have to worry about the queue or qnaire reminders
    parent::save();

    // add a hold if the consent is a new participation consent
    if( $new_record )
    {
      $db_consent_type = lib::create( 'database\consent_type', $this->consent_type_id );
      if( 'participation' == $db_consent_type->name )
      {
        $hold_class_name = lib::get_class_name( 'database\hold' );
        $hold_class_name::add_withdrawn_hold( $this );
      }
    }

    // get the most recent consent AFTER updating the record
    $db_latest_consent = $db_participant->get_last_consent( $db_consent_type );
    $new_accept = is_null( $db_latest_consent ) ? 'none' : $db_latest_consent->accept;

    if( $old_accept !== $new_accept )
      static::update_applications( $db_participant, $db_consent_type, $old_accept, $new_accept );
  }

  /**
   * Override the parent method
   * 
   * Depending on the consent-type of the affected consent record we may need to update the queue or qnaire mail after
   * the operation is complete.
   */
  public function delete()
  {
    $db_participant = $this->get_participant();
    $db_consent_type = $this->get_consent_type();

    // get the most recent consent BEFORE deleting the record
    $db_last_consent = $db_participant->get_last_consent( $db_consent_type );
    $old_accept = is_null( $db_last_consent ) ? 'none' : $db_last_consent->accept;

    parent::delete();

    // get the most recent consent AFTER deleting the record
    $db_latest_consent = $db_participant->get_last_consent( $db_consent_type );
    $new_accept = is_null( $db_latest_consent ) ? 'none' : $db_latest_consent->accept;

    if( $old_accept !== $new_accept )
      static::update_applications( $db_participant, $db_consent_type, $old_accept, $new_accept );
  }

  /**
   * Used by save() and delete() to notify other applications of the change of consent
   * 
   * @param database\participant $db_participant
   * @param database\consent_type $db_consent_type
   * @param boolean $old_accept The value of the consent before the change
   * @param boolean $new_accept The value of the consent after the change
   */
  private static function update_applications( $db_participant, $db_consent_type, $old_accept, $new_accept )
  {
    $application_class_name = lib::get_class_name( 'database\application' );

    $application_mod = lib::create( 'database\modifier' );
    $application_mod->join( 'application_has_participant', 'application.id', 'application_has_participant.application_id' );
    $application_mod->where( 'application_has_participant.participant_id', '=', $db_participant->id );
    $application_mod->where( 'application_has_participant.datetime', '!=', NULL );
    $application_mod->where( 'application.update_queue', '=', true );
    $application_list = $application_class_name::select_objects( $application_mod );

    if( 0 < count( $application_list ) )
    {
      // we need to complete any transactions before continuing
      lib::create( 'business\session' )->get_database()->complete_transaction();

      foreach( $application_list as $db_application )
      {
        // determine if we're updating the participation or extra consent type
        $consent_type = 'participation' == $db_consent_type->name ? 'participation' : NULL;
        if( is_null( $consent_type ) )
        {
          $db_extra_consent_type = $db_application->get_extra_consent_type();
          if( !is_null( $db_extra_consent_type ) && $db_extra_consent_type->id == $db_consent_type->id ) $consent_type = 'extra';
        }

        if( !is_null( $consent_type ) )
        {
          // NOTE: the following check is a bit complicated.  We only want to update applications when we're changing
          // the participant's effective consent status.  However, the application may considers a missing consent to
          // either be allowed or not allowed.  The following three statements, ORed together, solves that requirement
          if(
            // neither old or new is empty means we must update the app
            ( 'none' !== $old_accept && 'none' !== $new_accept ) ||
            // old is empty and new (which has to be true or false) is not the same as whether we allow missing consent
            ( 'none' === $old_accept && $new_accept !== $db_application->allow_missing_consent ) ||
            // new is empty and old (which has to be true or false) is not the same as whether we allow missing consent
            ( 'none' === $new_accept && $old_accept !== $db_application->allow_missing_consent ) )
          {
            try
            {
              $cenozo_manager = lib::create( 'business\cenozo_manager', $db_application );
              $cenozo_manager->patch( sprintf( 'participant/%s?repopulate=1', $db_participant->id ) );

              if( 'extra' == $consent_type )
              {
                // whether we're effectively changing to positive or negative consent depends on the application
                $accept = 'none' === $new_accept
                        ? $db_application->allow_missing_consent
                        : $new_accept;

                // either resend or remove mail, based on the new consent accept value
                $cenozo_manager->patch( sprintf(
                  'participant/%s?interview_mail=%s',
                  $db_participant->id,
                  $accept ? 'resend' : 'remove'
                ) );
              }
            }
            catch( \cenozo\exception\runtime $e )
            {
              // note runtime errors but keep processing anyway
              log::error( $e->get_message() );
            }
          }
        }
      }
    }
  }

  /**
   * Returns a string representation of the consent (eg: verbal deny, written accept, etc)
   * @return string
   * @access public
   */
  public function to_string()
  {
    return sprintf( '%s %s %s',
                    $this->get_consent_type()->name,
                    $this->written ? 'written' : 'verbal',
                    $this->accept ? 'accept' : 'deny' );
  }
}
