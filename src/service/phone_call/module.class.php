<?php
/**
 * module.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\service\phone_call;
use cenozo\lib, cenozo\log;

/**
 * Performs operations which effect how this module is used in a service
 */
class module extends \cenozo\service\site_restricted_module
{
  /**
   * Extend parent method
   */
  public function validate()
  {
    parent::validate();

    if( 300 > $this->get_status()->get_code() )
    {
      $service_class_name = lib::get_class_name( 'service\service' );
      $db_user = lib::create( 'business\session' )->get_user();
      $db_role = lib::create( 'business\session' )->get_role();

      $record = $this->get_resource();
      if( !is_null( $record ) )
      {
        // restrict by site
        $db_restrict_site = $this->get_restricted_site();
        if( !is_null( $db_restrict_site ) )
        {
          $db_assignment = $record->get_assignment();
          if( !is_null( $db_assignment ) )
          {
            $db_participant = $db_assignment->get_interview()->get_participant();
            if( $db_participant->get_effective_site()->id != $db_restrict_site->id )
            {
              $this->get_status()->set_code( 403 );
              return;
            }
          }
        }
      }

      $method = $this->get_method();
      $operation = $this->get_argument( 'operation', false );
      if( 'PATCH' == $method &&
          'close' == $operation &&
          !array_key_exists( 'status', $this->get_file_as_array() ) )
      {
        // can't close a phone call without defining the status
        $this->set_data( 'Cannot close a phone call without specifying the status.' );
        $this->get_status()->set_code( 400 );
      }
      else if( ( 'DELETE' == $method || 'PATCH' == $method ) &&
               3 > $db_role->tier &&
               $record->get_assignment()->user_id != $db_user->id )
      {
        // only admins can delete or modify phone calls other than their own
        $this->get_status()->set_code( 403 );
      }
      else if( 'POST' == $method )
      {
        // do not allow more than one open phone_call
        $data = NULL;

        if( !$db_user->has_open_assignment() )
          $data = 'Cannot create a new phone call since there is no open assignment.';
        else if( $db_user->has_open_phone_call() )
          $data = 'Cannot create a new phone call since you already have one open.';

        if( !is_null( $data ) )
        {
          $this->set_data( $data );
          $this->get_status()->set_code( 409 );
        }
      }
    }
  }

  /**
   * Extend parent method
   */
  public function prepare_read( $select, $modifier )
  {
    parent::prepare_read( $select, $modifier );

    // restrict by site
    $db_restrict_site = $this->get_restricted_site();
    if( !is_null( $db_restrict_site ) )
    {
      $modifier->join( 'assignment', 'phone_call.assignment_id', 'assignment.id' );
      $modifier->where( 'assignment.site_id', '=', $db_restrict_site->id );
    }

    if( $select->has_table_columns( 'phone' ) )
      $modifier->join( 'phone', 'phone_call.phone_id', 'phone.id' );
  }

  /**
   * Extend parent method
   */
  public function pre_write( $record )
  {
    parent::pre_write( $record );

    $util_class_name = lib::get_class_name( 'util' );

    $now = $util_class_name::get_datetime_object();
    $method = $this->get_method();
    $operation = $this->get_argument( 'operation', false );
    if( 'POST' == $method && 'open' == $operation )
    {
      $db_user = lib::create( 'business\session' )->get_user();
      $post_object = $this->get_file_as_object();
      $record->assignment_id = $db_user->get_open_assignment()->id;
      $record->phone_id = $post_object->phone_id;
      $record->start_datetime = $now;
    }
    else if( 'PATCH' == $method )
    {
      if( 'close' == $operation )
      { // close the phone call by setting the end datetime
        if( !is_null( $record->end_datetime ) )
        {
          log::warning( sprintf( 'Tried to close phone call id %d which is already closed.', $record->id ) );
        }
        else
        {
          $record->end_datetime = $now;
        }
      }
    }
  }

  /**
   * Extend parent method
   */
  public function post_write( $record )
  {
    parent::post_write( $record );

    $operation = $this->get_argument( 'operation', false );
    if( 'POST' == $this->get_method() && 'open' == $operation )
    {
      // run the assignment's post process routines
      $record->get_assignment()->post_process( false );
    }
    else if( 'PATCH' == $this->get_method() && 'close' == $operation )
    {
      $record->process_events();
    }
  }
}