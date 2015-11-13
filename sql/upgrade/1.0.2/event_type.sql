DROP PROCEDURE IF EXISTS patch_event_type;
DELIMITER //
CREATE PROCEDURE patch_event_type()
  BEGIN

    SELECT "Add new record_address column to event_type table" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "event_type"
      AND COLUMN_NAME = "record_address" );
    IF @test = 0 THEN
      ALTER TABLE event_type
      ADD COLUMN record_address TINYINT(1) NOT NULL DEFAULT 0 AFTER name;

      UPDATE event_type
      SET record_address = 1
      WHERE name LIKE "reached %"
      OR name LIKE "completed %";
    END IF;

  END //
DELIMITER ;

CALL patch_event_type();
DROP PROCEDURE IF EXISTS patch_event_type;

SELECT "Adding new event types" AS "";

UPDATE event_type
SET name = "mailed baseline reminder",
    description = "Participant mailed a reminder about their upcoming baseline interview."
WHERE name = "package mailed";

INSERT IGNORE INTO event_type( name, description ) VALUES
( "mailed follow-up-1 reminder", "Participant mailed a reminder about their upcoming follow-up-1 interview." );
