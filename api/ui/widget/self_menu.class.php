<?php
/**
 * self_menu.class.php
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @package cenozo\ui
 * @filesource
 */

namespace cenozo\ui\widget;
use cenozo\log, cenozo\util;
use cenozo\business as bus;
use cenozo\database as db;
use cenozo\exception as exc;

/**
 * widget self menu
 * 
 * @package cenozo\ui
 */
class self_menu extends \cenozo\ui\widget
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
    parent::__construct( 'self', 'menu', $args );
    $this->show_heading( false );
  }

  /**
   * Finish setting the variables in a widget.
   * 
   * @author Patrick Emond <emondpd@mcmaster.ca>
   * @access public
   */
  public function finish()
  {
    parent::finish();

    $db_role = bus\session::self()->get_role();

    // get all calendar widgets that the user has access to
    $calendars = array();

    $modifier = util::create( 'database\modifier' );
    $modifier->where( 'operation.type', '=', 'widget' );
    $modifier->where( 'operation.name', '=', 'calendar' );
    $widgets = $db_role->get_operation_list( $modifier );
    
    foreach( $widgets as $db_widget )
    {
      $calendars[] = array( 'heading' => str_replace( '_', ' ', $db_widget->subject ),
                            'subject' => $db_widget->subject,
                            'name' => $db_widget->name );
    }

    // get all list widgets that the user has access to
    $lists = array();

    $modifier = util::create( 'database\modifier' );
    $modifier->where( 'operation.type', '=', 'widget' );
    $modifier->where( 'operation.name', '=', 'list' );
    $widgets = $db_role->get_operation_list( $modifier );
    
    foreach( $widgets as $db_widget )
    {
      if( !in_array( $db_widget->subject, $this->exclude_widget_list ) )
        $lists[] = array(
          'heading' => util::pluralize( str_replace( '_', ' ', $db_widget->subject ) ),
          'subject' => $db_widget->subject,
          'name' => $db_widget->name );
    }

    // get all report widgets that the user has access to
    $reports = array();

    $modifier = util::create( 'database\modifier' );
    $modifier->where( 'operation.type', '=', 'widget' );
    $modifier->where( 'operation.name', '=', 'report' );
    $widgets = $db_role->get_operation_list( $modifier );
    
    foreach( $widgets as $db_widget )
    {
      $reports[] = array( 'heading' => str_replace( '_', ' ', $db_widget->subject ),
                          'subject' => $db_widget->subject,
                          'name' => $db_widget->name );
    }

    $this->set_variable( 'calendars', $calendars );
    $this->set_variable( 'lists', $lists );
    $this->set_variable( 'reports', $reports );
  }

  /**
   * An array of all widgets which are not to be included in the menu
   * @var array
   * @access protected
   */
  protected $exclude_widget_list = array( 'operation' );
}
?>
