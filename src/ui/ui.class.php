<?php
/**
 * ui.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @filesource
 */

namespace cenozo\ui;
use cenozo\lib, cenozo\log;

/**
 * Base class for all ui.
 *
 * All ui classes extend this base ui class.  All classes that extend this class are
 * used to fulfill some purpose executed by the user or machine interfaces.
 */
class ui extends \cenozo\base_object
{
  /**
   * Returns the interface
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @param array $error An associative array containing the error "title", "message" and "code", or
                         NULL if there is no error.
   * @return string
   * @access public
   */
  public function get_interface( $maintenance = false, $error = NULL )
  {
    $util_class_name = lib::get_class_name( 'util' );

    $interface = '';
    if( $maintenance || !is_null( $error ) )
    {
      $title = $maintenance ? 'The Application is Offline' : $error['title'];
      $message = $maintenance
               ? 'Sorry, the system is currently offline for maintenance. '.
                 'Please check with an administrator or try again at a later time.'
               : $error['message'];

      // build the error interface
      ob_start();
      define( 'APP_TITLE', ' ' );
      include( dirname( __FILE__ ).'/error.php' );
      $interface = ob_get_clean();
    }
    else if( is_null( lib::create( 'business\session' )->get_user() ) )
    { // no user means we haven't logged in, so show the login interface
      ob_start();
      include( dirname( __FILE__ ).'/login.php' );
      $interface = ob_get_clean();
    }
    else
    {
      // prepare the framework module list (used to identify which modules are provided by the framework)
      $framework_module_list = $this->get_framework_module_list();
      sort( $framework_module_list );

      // prepare the module list (used to create all necessary states needed by the active role)
      $this->build_module_list();

      // prepare which modules to show in the list
      $this->build_listitem_list();
      if( 0 == count( $this->listitem_list ) ) $this->listitem_list = NULL;
      else ksort( $this->listitem_list );

      // prepare which utilities to show in the list
      $utility_items = $this->get_utility_items();
      if( 0 == count( $utility_items ) ) $utility_items = NULL;
      else
      {
        ksort( $utility_items );

        foreach( $utility_items as $title => $item )
        {
          $module = $this->assert_module( $item['subject'] );
          $module->add_action( $item['action'], array_key_exists( 'query', $item ) ? $item['query'] : '' );
        }
      }

      // prepare which reports to show in the list
      $report_items = $this->get_report_items();
      if( 0 == count( $report_items ) ) $report_items = NULL;
      else ksort( $report_items );

      // create the json strings for the interface
      $module_array = array();
      foreach( $this->module_list as $module ) $module_array[$module->get_subject()] = $module->as_array();
      $framework_module_string = $util_class_name::json_encode( $framework_module_list );
      $module_string = $util_class_name::json_encode( $module_array );
      $listitem_string = $util_class_name::json_encode( $this->listitem_list );
      $utility_item_string = $util_class_name::json_encode( $utility_items );
      $report_item_string = $util_class_name::json_encode( $report_items );

      // empty actions will show as [] in json strings, convert to empty objects {}
      $module_string = str_replace( '"actions":[]', '"actions":{}', $module_string );

      // build the interface
      ob_start();
      include( dirname( __FILE__ ).'/interface.php' );
      $interface = ob_get_clean();
    }

    return $interface;
  }

  /**
   * Returns a list of all modules provided by the framework
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @return array( string )
   * @access protected
   */
  protected function get_framework_module_list()
  {
    $setting_manager = lib::create( 'business\setting_manager' );
    $list = array(
      'access', 'activity', 'address', 'alternate', 'application', 'application_type', 'availability_type',
      'cohort', 'collection', 'consent', 'consent_type', 'event', 'event_type', 'form', 'form_association',
      'form_type', 'hin', 'jurisdiction', 'language', 'participant', 'phone', 'quota', 'recording',
      'recording_file', 'region', 'region_site', 'role', 'report', 'report_restriction', 'report_schedule',
      'report_type', 'script', 'search_result', 'site', 'source', 'state', 'system_message', 'user', 'webphone'
    );

    if( $setting_manager->get_setting( 'module', 'interview' ) )
    {
      $list = array_merge( $list, array( 'assignment', 'interview', 'phone_call' ) );
      sort( $list );
    }

    return $list;
  }

  /**
   * Returns an array of all modules the current role has access to
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @return array( title, add )
   * @access protected
   */
  protected function build_module_list()
  {
    $service_class_name = lib::get_class_name( 'database\service' );
    $setting_manager = lib::create( 'business\setting_manager' );
    $use_interview_module = $setting_manager->get_setting( 'module', 'interview' );
    $db_role = lib::create( 'business\session' )->get_role();

    $select = lib::create( 'database\select' );
    $select->add_column( 'subject' );
    $select->add_column( 'method' );
    $select->add_column( 'resource' );

    $modifier = lib::create( 'database\modifier' );
    $join_mod = lib::create( 'database\modifier' );
    $join_mod->where( 'service.id', '=', 'role_has_service.service_id', false );
    $join_mod->where( 'role_has_service.role_id', '=', $db_role->id );
    $modifier->join_modifier( 'role_has_service', $join_mod, 'left' );
    $modifier->where_bracket( true );
    $modifier->where( 'service.restricted', '=', false );
    $modifier->or_where( 'role_has_service.role_id', '!=', NULL );
    $modifier->where_bracket( false );
    $modifier->order( 'subject' );
    $modifier->order( 'method' );

    foreach( $service_class_name::select( $select, $modifier ) as $service )
    {
      $module = $this->assert_module( $service['subject'] );

      // check that modules are activated before using them
      if( in_array( $module->get_subject(), array( 'assignment', 'interview', 'phone_call' ) ) )
      {
        if( !$use_interview_module )
          throw lib::create( 'exception\runtime',
            'Application has %s service but it\'s parent module, interview, is not activated.',
            __METHOD__ );
      }

      // add delete, view, list, edit and add actions
      if( 'DELETE' == $service['method'] )
      {
        $module->add_action( 'delete', '/{identifier}' );
      }
      else if( 'GET' == $service['method'] )
      {
        if( $service['resource'] ) $module->add_action( 'view', '/{identifier}' );
        else $module->add_action( 'list', '?{restrict}&{order}&{reverse}' );
      }
      else if( 'PATCH' == $service['method'] )
      {
        $module->add_action( 'edit', '/{identifier}' );
      }
      else if( 'POST' == $service['method'] )
      {
        $module->add_action( 'add', '' );
      }
    }

    foreach( $this->module_list as $module )
    {
      // add the module to the list menu if:
      // 1) it is the activity module and we can list it or
      // 2) we can both view and list it
      $module->set_list_menu(
        ( 'activity' == $module->get_subject() && $module->has_action( 'list' ) ) ||
        ( $module->has_action( 'list' ) && $module->has_action( 'view' ) )
      );

      // add child/choose actions to certain modules
      if( 'application' == $module->get_subject() )
      {
        $module->add_child( 'cohort' );
        $module->add_child( 'role' );
        $module->add_choose( 'site' );
        $module->add_choose( 'script' );
        $module->add_choose( 'collection' );
      }
      else if( 'assignment' == $module->get_subject() )
      {
        $module->add_child( 'phone_call' );
      }
      else if( 'alternate' == $module->get_subject() )
      {
        $module->add_child( 'address' );
        $module->add_child( 'phone' );
        $module->add_child( 'form' );
        $module->add_action( 'notes', '/{identifier}?{search}' );
        $module->add_action( 'history', '/{identifier}?{address}&{note}&{phone}' );
      }
      else if( 'availability_type' == $module->get_subject() )
      {
        $module->add_child( 'participant' );
      }
      else if( 'collection' == $module->get_subject() )
      {
        $module->add_choose( 'participant' );
        $module->add_choose( 'user' );
        if( 2 < $db_role->tier ) $module->add_choose( 'application' );
      }
      else if( 'consent' == $module->get_subject() )
      {
        $module->add_child( 'form' );
      }
      else if( 'consent_type' == $module->get_subject() )
      {
        $module->add_child( 'participant' );
      }
      else if( 'event' == $module->get_subject() )
      {
        $module->add_child( 'form' );
      }
      else if( 'event_type' == $module->get_subject() )
      {
        $module->add_child( 'participant' );
      }
      else if( 'form' == $module->get_subject() )
      {
        $module->add_child( 'form_association' );
      }
      else if( 'form_type' == $module->get_subject() )
      {
        $module->add_child( 'form' );
      }
      else if( 'interview' == $module->get_subject() )
      {
        $module->add_child( 'assignment' );
      }
      else if( 'participant' == $module->get_subject() )
      {
        if( $use_interview_module ) $module->add_child( 'interview' );
        $module->add_child( 'address' );
        $module->add_child( 'phone' );
        $module->add_child( 'consent' );
        $module->add_child( 'hin' );
        $module->add_child( 'alternate' );
        $module->add_child( 'event' );
        $module->add_child( 'form' );
        $module->add_choose( 'collection' );
        $module->add_action( 'history', $use_interview_module ?
          '/{identifier}?{address}&{alternate}&{assignment}&{consent}&{event}&{form}&{note}&{phone}' :
          '/{identifier}?{address}&{alternate}&{consent}&{event}&{form}&{note}&{phone}' );
        $module->add_action( 'notes', '/{identifier}?{search}' );
        // remove the add action it is used for utility purposes only
        $module->remove_action( 'add' );
      }
      else if( 'recording' == $module->get_subject() )
      {
        $module->add_child( 'recording_file' );
      }
      else if( 'report_type' == $module->get_subject() )
      {
        $module->add_child( 'report' );
        $module->add_child( 'report_schedule' );
        $module->add_child( 'report_restriction' );
        $module->add_choose( 'application_type' );
        $module->add_choose( 'role' );
      }
      else if( 'script' == $module->get_subject() )
      {
        $module->add_choose( 'application' );
      }
      else if( 'site' == $module->get_subject() )
      {
        $module->add_child( 'access' );
        $module->add_child( 'activity' );
      }
      else if( 'source' == $module->get_subject() )
      {
        $module->add_child( 'participant' );
      }
      else if( 'state' == $module->get_subject() )
      {
        $module->add_child( 'role' );
        $module->add_child( 'participant' );
      }
      else if( 'user' == $module->get_subject() )
      {
        if( 1 < $db_role->tier )
        {
          $module->add_child( 'access' );
          $module->add_child( 'activity' );
          $module->add_choose( 'language' );
        }
      }
    }

    ksort( $this->module_list );
  }

  /**
   * Returns an array of all states to include in the menu
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @return array( title, add )
   * @access protected
   */
  protected function build_listitem_list()
  {
    $setting_manager = lib::create( 'business\setting_manager' );
    $session = lib::create( 'business\session' );
    $db_role = $session->get_role();
    $extended = in_array( $db_role->name, array( 'administrator', 'curator', 'helpline' ) );
    $grouping_list = $session->get_application()->get_cohort_groupings();

    $this->add_listitem( 'Activities', 'activity' );
    if( $extended ) $this->add_listitem( 'Alternates', 'alternate' );
    $this->add_listitem( 'Applications', 'application' );
    $this->add_listitem( 'Availability Types', 'availability_type' );
    $this->add_listitem( 'Collections', 'collection' );
    $this->add_listitem( 'Consent Types', 'consent_type' );
    $this->add_listitem( 'Event Types', 'event_type' );
    if( $extended ) $this->add_listitem( 'Form Types', 'form_type' );
    if( $setting_manager->get_setting( 'module', 'interview' ) ) $this->add_listitem( 'Interviews', 'interview' );
    if( $extended && in_array( 'jurisdiction', $grouping_list ) )
    $this->add_listitem( 'Jurisdictions', 'jurisdiction' );
    if( $extended ) $this->add_listitem( 'Languages', 'language' );
    $this->add_listitem( 'Participants', 'participant' );
    $this->add_listitem( 'Quotas', 'quota' );
    if( 3 <= $db_role->tier ) $this->add_listitem( 'Recordings', 'recording' );
    if( $extended && in_array( 'region', $grouping_list ) ) $this->add_listitem( 'Region Sites', 'region_site' );
    if( 3 <= $db_role->tier ) $this->add_listitem( 'Scripts', 'script' );
    $this->add_listitem( 'Settings', 'setting' );
    if( $db_role->all_sites ) $this->add_listitem( 'Sites', 'site' );
    if( $extended ) $this->add_listitem( 'Sources', 'source' );
    $this->add_listitem( 'States', 'state' );
    $this->add_listitem( 'System Messages', 'system_message' );
    $this->add_listitem( 'Users', 'user' );
  }

  /**
   * Returns an array of all utility modules
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @return array
   * @access protected
   */
  protected function get_utility_items()
  {
    $setting_manager = lib::create( 'business\setting_manager' );
    $db_role = lib::create( 'business\session' )->get_role();

    $list = array();

    if( 3 <= $db_role->tier )
      $list['Participant Multiedit'] = array( 'subject' => 'participant', 'action' => 'multiedit' );
    $list['Participant Search'] = array(
      'subject' => 'search_result',
      'action' => 'list',
      'query' => '?{q}&{restrict}&{order}&{reverse}' );
    $list['User Overview'] = array(
      'subject' => 'user',
      'action' => 'overview',
      'query' => '?{restrict}&{order}&{reverse}' );
    if( $setting_manager->get_setting( 'voip', 'enabled' ) )
      $list['Webphone'] = array(
        'subject' => 'webphone',
        'action' => 'status',
        'target' => 'webphone' );

    return $list;
  }

  /**
   * Returns an array of all report modules
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @return array
   * @access protected
   */
  protected function get_report_items()
  {
    $report_list = array();

    $session = lib::create( 'business\session' );
    $db_application_type = $session->get_application()->get_application_type();
    $db_role = $session->get_role();

    $select = lib::create( 'database\select' );
    $select->add_column( 'name' );
    $select->add_column( 'title' );
    $modifier = lib::create( 'database\modifier' );
    $modifier->join( 'role_has_report_type', 'report_type.id', 'role_has_report_type.report_type_id' );
    $modifier->where( 'role_has_report_type.role_id', '=', $db_role->id );
    foreach( $db_application_type->get_report_type_list( $select, $modifier ) as $report_type )
      $report_list[$report_type['title']] = $report_type['name'];

    return $report_list;
  }

  /**
   * TODO: document
   */
  protected function get_module( $subject )
  {
    return array_key_exists( $subject, $this->module_list ) ? $this->module_list[$subject] : NULL;
  }

  /**
   * TODO: document
   */
  protected function assert_module( $subject )
  {
    if( !array_key_exists( $subject, $this->module_list ) )
      $this->module_list[$subject] = lib::create( 'ui\module', $subject );
    return $this->module_list[$subject];
  }

  /**
   * TODO: document
   */
  protected function set_all_list_menu( $list_menu )
  {
    foreach( $this->module_list as $module ) $module->set_list_menu( $list_menu );
  }

  /**
   * TODO: document
   */
  protected function add_listitem( $title, $subject )
  {
    if( array_key_exists( $subject, $this->module_list ) )
    {
      $module = $this->module_list[$subject];
      if( $module->get_list_menu() && $module->has_action( 'list' ) ) $this->listitem_list[$title] = $subject;
    }
  }

  /**
   * TODO: document
   */
  protected function remove_listitem( $title )
  {
    if( array_key_exists( $title, $this->listitem_list ) ) unset( $this->listitem_list[$title] );
  }

  /**
   * TODO: document
   */
  protected function has_listitem( $title )
  {
    return array_key_exists( $title, $this->listitem_list );
  }

  /**
   * TODO: document
   */
  private $module_list = array();

  /**
   * TODO: document
   */
  private $listitem_list = array();
}
