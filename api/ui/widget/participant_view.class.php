<?php
/**
 * participant_view.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\ui\widget;
use cenozo\lib, cenozo\log;

/**
 * widget participant view
 */
class participant_view extends base_view
{
  /**
   * Constructor
   * 
   * Defines all variables which need to be set for the associated template.
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param array $args An associative array of arguments to be processed by the widget
   * @access public
   */
  public function __construct( $args )
  {
    parent::__construct( 'participant', 'view', $args );
  }

  /**
   * Processes arguments, preparing them for the operation.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @throws exception\notice
   * @access protected
   */
  protected function prepare()
  {
    parent::prepare();
    
    // create an associative array with everything we want to display about the participant
    $this->add_item( 'active', 'boolean', 'Active' );
    $this->add_item( 'uid', 'constant', 'Unique ID' );
    $this->add_item( 'source', 'constant', 'Source' );
    $this->add_item( 'cohort', 'constant', 'Cohort' );
    $this->add_item( 'first_name', 'string', 'First Name' );
    $this->add_item( 'last_name', 'string', 'Last Name' );
    $this->add_item( 'language', 'enum', 'Preferred Language' );
    $this->add_item( 'status', 'enum', 'Condition' );

    // add an item for default and preferred sites for all services the participant's cohort
    // belongs to
    foreach( $this->get_record()->get_cohort()->get_service_list() as $db_service )
    {
      $this->add_item(
        sprintf( '%s_default_site', $db_service->name ), 'constant', 'Default Site' );
      $this->add_item(
        sprintf( '%s_site_id', $db_service->name ), 'enum', 'Preferred Site' );
    }

    $this->add_item( 'email', 'string', 'Email' );
    $this->add_item( 'gender', 'enum', 'Gender' );
    $this->add_item( 'date_of_birth', 'date', 'Date of Birth' );
    $this->add_item( 'age_group', 'constant', 'Age Group' );

    // create the address sub-list widget
    try
    {
      $this->address_list = lib::create( 'ui\widget\address_list', $this->arguments );
      $this->address_list->set_parent( $this );
      $this->address_list->set_heading( 'Addresses' );
    }
    catch( \cenozo\exception\runtime $e ) {}


    // create the phone sub-list widget
    try
    {
      $this->phone_list = lib::create( 'ui\widget\phone_list', $this->arguments );
      $this->phone_list->set_parent( $this );
      $this->phone_list->set_heading( 'Phone numbers' );
    }
    catch( \cenozo\exception\runtime $e ) {}

    // create the availability sub-list widget
    try
    {
      $this->availability_list = lib::create( 'ui\widget\availability_list', $this->arguments );
      $this->availability_list->set_parent( $this );
      $this->availability_list->set_heading( 'Availability' );
    }
    catch( \cenozo\exception\runtime $e ) {}

    // create the consent sub-list widget
    try
    {
      $this->consent_list = lib::create( 'ui\widget\consent_list', $this->arguments );
      $this->consent_list->set_parent( $this );
      $this->consent_list->set_heading( 'Consent information' );
    }
    catch( \cenozo\exception\runtime $e ) {}

    // create the alternate sub-list widget
    try
    {
      $this->alternate_list = lib::create( 'ui\widget\alternate_list', $this->arguments );
      $this->alternate_list->set_parent( $this );
      $this->alternate_list->set_heading( 'Alternate contacts' );
    }
    catch( \cenozo\exception\runtime $e )
    {
      if( RUNTIME__CENOZO_UI_OPERATION____CONSTRUCT__ERRNO != $e->get_number() )
        throw $e;
    }
  }

  /**
   * Finish setting the variables in a widget.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access protected
   */
  protected function setup()
  {
    parent::setup();

    // create enum arrays
    $participant_class_name = lib::get_class_name( 'database\participant' );
    $record = $this->get_record();

    $genders = $participant_class_name::get_enum_values( 'gender' );
    $genders = array_combine( $genders, $genders );
    $languages = $participant_class_name::get_enum_values( 'language' );
    $languages = array_combine( $languages, $languages );
    $statuses = $participant_class_name::get_enum_values( 'status' );
    $statuses = array_combine( $statuses, $statuses );

    $age_group = '';
    if( !is_null( $record->age_group_id ) )
    {
      $db_age_group = lib::create( 'database\age_group', $record->age_group_id );
      $age_group = sprintf( '%d to %d', $db_age_group->lower, $db_age_group->upper );
    }

    // set the view's items
    $this->set_item( 'active', $record->active, true );
    $this->set_item( 'uid', $record->uid, true );
    $this->set_item( 'cohort', $record->get_cohort()->name );
    $this->set_item( 'source', $record->get_source()->name );
    $this->set_item( 'first_name', $record->first_name );
    $this->set_item( 'last_name', $record->last_name );
    $this->set_item( 'language', $record->language, false, $languages );
    $this->set_item( 'status', $record->status, false, $statuses );

    // set items for default and preferred sites for all services the participant's cohort
    // belongs to
    foreach( $this->get_record()->get_cohort()->get_service_list() as $db_service )
    {
      $sites = array();
      $site_mod = lib::create( 'database\modifier' );
      $site_mod->order( 'service_id' );
      $site_mod->order( 'name' );
      foreach( $db_service->get_site_list( $site_mod ) as $db_site )
        $sites[$db_site->id] = $db_site->name;

      $db_default_site = $record->get_default_site( $db_service );
      $this->set_item(
        sprintf( '%s_default_site', $db_service->name ),
        is_null( $db_default_site ) ? '(none)' : $db_default_site->name );
      $db_preferred_site = $record->get_preferred_site( $db_service );
      $this->set_item(
        sprintf( '%s_site_id', $db_service->name ),
        is_null( $db_preferred_site ) ? '' : $db_preferred_site->id, false, $sites );
    }

    $this->set_item( 'email', $record->email, false );
    $this->set_item( 'gender', $record->gender, true, $genders );
    $this->set_item( 'date_of_birth', $record->date_of_birth );
    $this->set_item( 'age_group', $age_group );

    // add a contact form download action
    $db_contact_form = $record->get_contact_form();
    if( !is_null( $db_contact_form ) )
      $this->set_variable( 'contact_form_id', $db_contact_form->id );
    $this->add_action( 'contact_form', 'Contact Form', NULL,
      'Download this participant\'s contact form, if available' );

    try
    {
      $this->address_list->process();
      $this->set_variable( 'address_list', $this->address_list->get_variables() );
    }
    catch( \cenozo\exception\permission $e ) {}

    try
    {
      $this->phone_list->process();
      $this->set_variable( 'phone_list', $this->phone_list->get_variables() );
    }
    catch( \cenozo\exception\permission $e ) {}

    try
    {
      $this->availability_list->process();
      $this->set_variable( 'availability_list', $this->availability_list->get_variables() );
    }
    catch( \cenozo\exception\permission $e ) {}

    try
    {
      $this->consent_list->process();
      $this->set_variable( 'consent_list', $this->consent_list->get_variables() );
    }
    catch( \cenozo\exception\permission $e ) {}

    try
    {
      $this->alternate_list->process();
      $this->set_variable( 'alternate_list', $this->alternate_list->get_variables() );
    }
    catch( \cenozo\exception\permission $e ) {}
  }

  /**
   * The address list widget.
   * @var address_list
   * @access protected
   */
  protected $address_list = NULL;
  
  /**
   * The phone list widget.
   * @var phone_list
   * @access protected
   */
  protected $phone_list = NULL;
  
  /**
   * The availability list widget.
   * @var availability_list
   * @access protected
   */
  protected $availability_list = NULL;
  
  /**
   * The consent list widget.
   * @var consent_list
   * @access protected
   */
  protected $consent_list = NULL;
  
  /**
   * The alternate contact person list widget.
   * @var alternate_list
   * @access protected
   */
  protected $alternate_list = NULL;
}
