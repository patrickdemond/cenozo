<?php
/**
 * error_codes.inc.php
 * 
 * This file is where all error codes are defined.
 * All error code are named after the class and function they occur in.
 * @package cenozo\exception
 * @filesource
 */

namespace cenozo\exception;

/**
 * Error number category defines.
 */
define( 'ARGUMENT_BASE_ERROR_NUMBER',   100000 );
define( 'DATABASE_BASE_ERROR_NUMBER',   200000 );
define( 'LDAP_BASE_ERROR_NUMBER',       300000 );
define( 'NOTICE_BASE_ERROR_NUMBER',     400000 );
define( 'PERMISSION_BASE_ERROR_NUMBER', 500000 );
define( 'RUNTIME_BASE_ERROR_NUMBER',    600000 );
define( 'SYSTEM_BASE_ERROR_NUMBER',     700000 );
define( 'TEMPLATE_BASE_ERROR_NUMBER',   800000 );

/**
 * "argument" error codes
 */
define( 'ARGUMENT_ACCESS__EXISTS_ERROR_NUMBER',               ARGUMENT_BASE_ERROR_NUMBER + 1 );
define( 'ARGUMENT_BASE_REPORT__ADD_RESTRICTION_ERROR_NUMBER', ARGUMENT_BASE_ERROR_NUMBER + 2 );
define( 'ARGUMENT_BASE_REPORT__SET_PARAMETER_ERROR_NUMBER',   ARGUMENT_BASE_ERROR_NUMBER + 3 );
define( 'ARGUMENT_BASE_VIEW__SET_ITEM_ERROR_NUMBER',          ARGUMENT_BASE_ERROR_NUMBER + 4 );
define( 'ARGUMENT_MODIFIER__WHERE_ERROR_NUMBER',              ARGUMENT_BASE_ERROR_NUMBER + 5 );
define( 'ARGUMENT_MODIFIER__GROUP_ERROR_NUMBER',              ARGUMENT_BASE_ERROR_NUMBER + 6 );
define( 'ARGUMENT_MODIFIER__ORDER_ERROR_NUMBER',              ARGUMENT_BASE_ERROR_NUMBER + 7 );
define( 'ARGUMENT_MODIFIER__LIMIT_ERROR_NUMBER',              ARGUMENT_BASE_ERROR_NUMBER + 8 );
define( 'ARGUMENT_OPERATION____CONSTRUCT_ERROR_NUMBER',       ARGUMENT_BASE_ERROR_NUMBER + 9 );
define( 'ARGUMENT_OPERATION__GET_ARGUMENT_ERROR_NUMBER',      ARGUMENT_BASE_ERROR_NUMBER + 10 );
define( 'ARGUMENT_RECORD____GET_ERROR_NUMBER',                ARGUMENT_BASE_ERROR_NUMBER + 11 );
define( 'ARGUMENT_RECORD____SET_ERROR_NUMBER',                ARGUMENT_BASE_ERROR_NUMBER + 12 );
define( 'ARGUMENT_RECORD____CALL_ERROR_NUMBER',               ARGUMENT_BASE_ERROR_NUMBER + 13 );
define( 'ARGUMENT_REPORT____CALL_ERROR_NUMBER',               ARGUMENT_BASE_ERROR_NUMBER + 14 );
define( 'ARGUMENT_SELF_SET_ROLE__FINISH_ERROR_NUMBER',        ARGUMENT_BASE_ERROR_NUMBER + 15 );
define( 'ARGUMENT_SELF_SET_SITE__FINISH_ERROR_NUMBER',        ARGUMENT_BASE_ERROR_NUMBER + 16 );
define( 'ARGUMENT_SETTING_MANAGER____CONSTRUCT_ERROR_NUMBER', ARGUMENT_BASE_ERROR_NUMBER + 17 );
define( 'ARGUMENT_SITE__ADD_ACCESS_ERROR_NUMBER',             ARGUMENT_BASE_ERROR_NUMBER + 18 );
define( 'ARGUMENT_USER__ADD_ACCESS_ERROR_NUMBER',             ARGUMENT_BASE_ERROR_NUMBER + 19 );
define( 'ARGUMENT_WIDGET__GET_ARGUMENT_ERROR_NUMBER',         ARGUMENT_BASE_ERROR_NUMBER + 20 );

/**
 * "database" error codes
 * 
 * Since database errors already have codes this list is likely to stay empty.
 */

/**
 * "ldap" error codes
 * 
 * Since ldap errors already have codes this list is likely to stay empty.
 */

/**
 * "notice" error codes
 */
define( 'NOTICE_BASE_DELETE__FINISH_ERROR_NUMBER',           NOTICE_BASE_ERROR_NUMBER + 1 );
define( 'NOTICE_BASE_EDIT__FINISH_ERROR_NUMBER',             NOTICE_BASE_ERROR_NUMBER + 2 );
define( 'NOTICE_BASE_NEW__FINISH_ERROR_NUMBER',              NOTICE_BASE_ERROR_NUMBER + 3 );
define( 'NOTICE_ROLE_NEW__FINISH_ERROR_NUMBER',              NOTICE_BASE_ERROR_NUMBER + 4 );
define( 'NOTICE_SELF_SET_PASSWORD__FINISH_ERROR_NUMBER',     NOTICE_BASE_ERROR_NUMBER + 5 );
define( 'NOTICE_SESSION__SET_USER_ERROR_NUMBER',             NOTICE_BASE_ERROR_NUMBER + 6 );
define( 'NOTICE_SITE_NEW__FINISH_ERROR_NUMBER',              NOTICE_BASE_ERROR_NUMBER + 7 );
define( 'NOTICE_SYSTEM_MESSAGE_DELETE__FINISH_ERROR_NUMBER', NOTICE_BASE_ERROR_NUMBER + 8 );
define( 'NOTICE_SYSTEM_MESSAGE_EDIT__FINISH_ERROR_NUMBER',   NOTICE_BASE_ERROR_NUMBER + 9 );
define( 'NOTICE_SYSTEM_MESSAGE_NEW__FINISH_ERROR_NUMBER',    NOTICE_BASE_ERROR_NUMBER + 10 );
define( 'NOTICE_USER_NEW__FINISH_ERROR_NUMBER',              NOTICE_BASE_ERROR_NUMBER + 11 );

/**
 * "permission" error codes
 */
define( 'PERMISSION_ACCESS__SAVE_ERROR_NUMBER',               PERMISSION_BASE_ERROR_NUMBER + 1 );
define( 'PERMISSION_ACCESS__DELETE_ERROR_NUMBER',             PERMISSION_BASE_ERROR_NUMBER + 2 );
define( 'PERMISSION_OPERATION____CONSTRUCT_ERROR_NUMBER',     PERMISSION_BASE_ERROR_NUMBER + 3 );
define( 'PERMISSION_SESSION__INITIALIZE_ERROR_NUMBER',        PERMISSION_BASE_ERROR_NUMBER + 4 );
define( 'PERMISSION_SESSION__SET_SITE_AND_ROLE_ERROR_NUMBER', PERMISSION_BASE_ERROR_NUMBER + 5 );

/**
 * "runtime" error codes
 */
define( 'RUNTIME_BASE_REPORT__SET_PARAMETER_ERROR_NUMBER',      RUNTIME_BASE_ERROR_NUMBER + 1 );
define( 'RUNTIME_BASE_VIEW__SET_ITEM_ERROR_NUMBER',             RUNTIME_BASE_ERROR_NUMBER + 2 );
define( 'RUNTIME_CENOZO_MANAGER__SEND_ERROR_NUMBER',            RUNTIME_BASE_ERROR_NUMBER + 3 );
define( 'RUNTIME_DATABASE__GET_COLUMN_NAMES_ERROR_NUMBER',      RUNTIME_BASE_ERROR_NUMBER + 4 );
define( 'RUNTIME_DATABASE__GET_COLUMN_TYPE_ERROR_NUMBER',       RUNTIME_BASE_ERROR_NUMBER + 5 );
define( 'RUNTIME_DATABASE__GET_COLUMN_DATA_TYPE_ERROR_NUMBER',  RUNTIME_BASE_ERROR_NUMBER + 6 );
define( 'RUNTIME_DATABASE__GET_COLUMN_KEY_ERROR_NUMBER',        RUNTIME_BASE_ERROR_NUMBER + 7 );
define( 'RUNTIME_DATABASE__GET_COLUMN_DEFAULT_ERROR_NUMBER',    RUNTIME_BASE_ERROR_NUMBER + 8 );
define( 'RUNTIME_DATABASE__GET_UNIQUE_KEYS_ERROR_NUMBER',       RUNTIME_BASE_ERROR_NUMBER + 9 );
define( 'RUNTIME_DATABASE__CONNECT_ERROR_NUMBER',               RUNTIME_BASE_ERROR_NUMBER + 10 );
define( 'RUNTIME_FACTORY__SELF_ERROR_NUMBER',                   RUNTIME_BASE_ERROR_NUMBER + 11 );
define( 'RUNTIME_FACTORY__EXISTS_ERROR_NUMBER',                 RUNTIME_BASE_ERROR_NUMBER + 12 );
define( 'RUNTIME_LDAP_MANAGER__VALIDATE_USER_ERROR_NUMBER',     RUNTIME_BASE_ERROR_NUMBER + 13 );
define( 'RUNTIME_LDAP_MANAGER__SET_USER_PASSWORD_ERROR_NUMBER', RUNTIME_BASE_ERROR_NUMBER + 14 );
define( 'RUNTIME_LOG__INITIALIZE_LOGGER_ERROR_NUMBER',          RUNTIME_BASE_ERROR_NUMBER + 15 );
define( 'RUNTIME_NOTE_LIST__FINISH_ERROR_NUMBER',               RUNTIME_BASE_ERROR_NUMBER + 16 );
define( 'RUNTIME_NOTE_NEW__FINISH_ERROR_NUMBER',                RUNTIME_BASE_ERROR_NUMBER + 17 );
define( 'RUNTIME_OPERATION____CONSTRUCT_ERROR_NUMBER',          RUNTIME_BASE_ERROR_NUMBER + 18 );
define( 'RUNTIME_RECORD____CONSTRUCT_ERROR_NUMBER',             RUNTIME_BASE_ERROR_NUMBER + 19 );
define( 'RUNTIME_RECORD__LOAD_ERROR_NUMBER',                    RUNTIME_BASE_ERROR_NUMBER + 20 );
define( 'RUNTIME_RECORD__SAVE_ERROR_NUMBER',                    RUNTIME_BASE_ERROR_NUMBER + 21 );
define( 'RUNTIME_RECORD____CALL_ERROR_NUMBER',                  RUNTIME_BASE_ERROR_NUMBER + 22 );
define( 'RUNTIME_REPORT____CALL_ERROR_NUMBER',                  RUNTIME_BASE_ERROR_NUMBER + 23 );
define( 'RUNTIME_REPORT__SET_CELL_ERROR_NUMBER',                RUNTIME_BASE_ERROR_NUMBER + 24 );
define( 'RUNTIME_REPORT__MERGE_CELLS_ERROR_NUMBER',             RUNTIME_BASE_ERROR_NUMBER + 25 );
define( 'RUNTIME_SELF_SET_SITE__FINISH_ERROR_NUMBER',           RUNTIME_BASE_ERROR_NUMBER + 26 );
define( 'RUNTIME_UTIL__AUTOLOAD_ERROR_NUMBER',                  RUNTIME_BASE_ERROR_NUMBER + 27 );

/**
 * "system" error codes
 * 
 * Since system errors already have codes this list is likely to stay empty.
 * Note the following PHP error codes:
 *      1: error,
 *      2: warning,
 *      4: parse,
 *      8: notice,
 *     16: core error,
 *     32: core warning,
 *     64: compile error,
 *    128: compile warning,
 *    256: user error,
 *    512: user warning,
 *   1024: user notice
 */

/**
 * "template" error codes
 * 
 * Since template errors already have codes this list is likely to stay empty.
 */

?>
