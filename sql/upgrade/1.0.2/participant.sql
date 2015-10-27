DROP PROCEDURE IF EXISTS patch_participant;
DELIMITER //
CREATE PROCEDURE patch_participant()
  BEGIN

    SELECT "Add new other_name column to participant table" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "participant"
      AND COLUMN_NAME = "other_name" );
    IF @test = 0 THEN
      ALTER TABLE participant 
      ADD COLUMN other_name VARCHAR(100) NULL DEFAULT NULL
      AFTER first_name;

      -- update the other_name of participants who have been censored
      UPDATE participant
      SET other_name = "(censored)"
      WHERE first_name = "(censored)";
    END IF;

    SELECT "Add new honorific column to participant table" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "participant"
      AND COLUMN_NAME = "honorific" );
    IF @test = 0 THEN
      ALTER TABLE participant 
      ADD COLUMN honorific VARCHAR(10) NOT NULL
      AFTER grouping;

      -- define the honorific based on gender
      UPDATE participant
      SET honorific = IF( "male" = gender, "Mr.", "Ms." );

      -- update the honorific of participants who have been censored
      UPDATE participant
      SET honorific = "(censored)"
      WHERE first_name = "(censored)";
    END IF;

    SELECT "Add new out_of_area column to participant table" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "participant"
      AND COLUMN_NAME = "out_of_area" );
    IF @test = 0 THEN
      ALTER TABLE participant 
      ADD COLUMN out_of_area TINYINT(1) NOT NULL DEFAULT 0
      AFTER withdraw_letter;
    END IF;

  END //
DELIMITER ;

CALL patch_participant();
DROP PROCEDURE IF EXISTS patch_participant;
