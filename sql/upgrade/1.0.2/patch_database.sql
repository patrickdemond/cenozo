-- Patch to upgrade database to version 1.0.2

SET AUTOCOMMIT=0;

SOURCE participant.sql
SOURCE event.sql
SOURCE event_type.sql
SOURCE event_address.sql
SOURCE variable_cache.sql
SOURCE hin.sql

SOURCE update_version_number.sql

COMMIT;
