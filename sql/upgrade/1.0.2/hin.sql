DROP PROCEDURE IF EXISTS patch_hin;
DELIMITER //
CREATE PROCEDURE patch_hin()
  BEGIN

    SELECT "Add new extended_access column to hin table" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "hin"
      AND COLUMN_NAME = "extended_access" );
    IF @test = 0 THEN
      ALTER TABLE hin 
      ADD COLUMN extended_access TINYINT(1) NULL DEFAULT NULL
      AFTER future_access;
    END IF;

  END //
DELIMITER ;

CALL patch_hin();
DROP PROCEDURE IF EXISTS patch_hin;
