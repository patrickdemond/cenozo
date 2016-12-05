<?php
/**
 * cenozo.ini.php
 * 
 * Defines initialization settings for cenozo.
 * DO NOT edit this file, to override these settings use settings.local.ini.php instead.
 * When this file is loaded it only defines setting values if they are not already defined.
 * 
 * @author Patrick Emond <emondpd@mcmaster.ca>
 * @package cenozo
 */

$settings = array();

// framework software version (is never overridded by the application's ini file)
$settings['general']['cenozo_version'] = '2.0.1';
$settings['general']['cenozo_build'] = '9d672eb';

// when set to true all operations are disabled
$settings['general']['maintenance_mode'] = false;

// always leave as false when running as production server
$settings['general']['development_mode'] = false;

// whether to show all API requests in the log (VERY verbose)
$settings['general']['show_api_calls'] = false;

// define the minimum version of all supported browsers
$settings['general']['chrome_minimum_version'] = 40;
$settings['general']['firefox_minimum_version'] = 40;

// the default password given to all new users
$settings['general']['default_password'] = 'password';

// the maximum number of login failures before deactivating a user
$settings['general']['login_failure_limit'] = 15;

// how long before a search result is considered out of date (in minutes)
$settings['general']['search_timeout'] = 10;

// how much inactivity before activity logs are considered closed (in minutes)
$settings['general']['activity_timeout'] = 60;

// how much inactivity before withdraw scripts are considered abandoned (in minutes)
$settings['general']['withdraw_timeout'] = 60;

// list of all optional modules (off by default)
$settings['module']['interview'] = false;
$settings['module']['recording'] = false;

// the maximum time allowed for a report to finish (in seconds)
$settings['report']['time_limit'] = 180;

// the maximum number of cells allowed in a non-csv report
$settings['report']['max_cells'] = 20000;

// the maximum number of rows allowed in a list-report
$settings['report']['max_big_rows'] = 10000;

// the maximum number of rows allowed in a non-csv list-report
$settings['report']['max_small_rows'] = 1000;

// cenozo's sub-directory urls
$settings['url']['ROOT'] = substr( $_SERVER['PHP_SELF'], 0, strrpos( $_SERVER['PHP_SELF'], '/' ) );
if( array_key_exists( 'CENOZO', $this->settings['url'] ) )
{
  $settings['url']['APP'] = $this->settings['url']['CENOZO'].'/app';
  $settings['url']['CSS'] = $this->settings['url']['CENOZO'].'/css';
  $settings['url']['IMG'] = $this->settings['url']['CENOZO'].'/img';
  $settings['url']['LIB'] = $this->settings['url']['CENOZO'].'/lib';
}

// path to store cookies under
$settings['path']['COOKIE'] = substr( $_SERVER['SCRIPT_NAME'], 0, -9 );

// the location of cenozo internal path
$settings['path']['CENOZO'] = str_replace( '/settings.ini.php', '', __FILE__ );

// the location of log files
$settings['path']['LOG_FILE'] = '/var/local/cenozo/log';

// the location of exports (defaults to cenozo/doc/export)
$settings['path']['EXPORT'] = str_replace( 'settings.ini.php', 'doc/export', __FILE__ );

// the location of reports (defaults to cenozo/doc/report)
$settings['path']['REPORT'] = str_replace( 'settings.ini.php', 'doc/report', __FILE__ );

// the location of forms (defaults to cenozo/doc/form)
$settings['path']['FORM'] = str_replace( 'settings.ini.php', 'doc/form', __FILE__ );

// the location of the temporary files
$settings['path']['TEMP'] =
  '/tmp/'.$this->settings['general']['framework_name'].$this->settings['path']['APPLICATION'];
$settings['path']['TEMPORARY_FILES'] = $settings['path']['TEMP'].'/files';

// the url of limesurvey and database information found in application/config/config.php
$settings['path']['LIMESURVEY'] = '/var/www/limesurvey';
$settings['url']['LIMESURVEY'] = '../limesurvey';

// the url of PHPExcel
$settings['path']['PHPEXCEL'] = str_replace( 'settings.ini.php', '../PHPExcel', __FILE__ );

// the location of the Shift8 Asterisk library
$settings['path']['SHIFT8'] = str_replace( 'settings.ini.php', '../shift8', __FILE__ );

// utility account
$settings['utility']['username'] = 'cenozo';
$settings['utility']['password'] = '';

// database settings
$settings['db']['server'] = 'localhost';
$settings['db']['database_prefix'] = '';
$settings['db']['prefix'] = '';
$settings['db']['query_limit'] = 100;

// ldap settings
$settings['ldap']['enabled'] = true;
$settings['ldap']['server'] = 'localhost';
$settings['ldap']['port'] = 389;
$settings['ldap']['base'] = '';
$settings['ldap']['username'] = '';
$settings['ldap']['password'] = '';
$settings['ldap']['type'] = 'samba'; // can be standard, active or samba
$settings['ldap']['timeout'] = 10; // in seconds

// opal settings
$settings['opal']['enabled'] = false;
$settings['opal']['server'] = 'localhost';
$settings['opal']['port'] = 8843;
$settings['opal']['username'] = '';
$settings['opal']['password'] = '';

// voip settings
$settings['voip']['enabled'] = false;
$settings['voip']['url'] = 'http://localhost:8088/mxml';
$settings['voip']['username'] = '';
$settings['voip']['password'] = '';
$settings['voip']['prefix'] = '';
$settings['voip']['monitor'] = '/var/local/recordings';
