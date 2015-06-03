DROP PROCEDURE IF EXISTS patch_user;
DELIMITER //
CREATE PROCEDURE patch_user()
  BEGIN

    SELECT "Removing defunct language column from user table" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "user"
      AND COLUMN_NAME = "language" );
    IF @test = 1 THEN
      ALTER TABLE user DROP COLUMN language;
    END IF;

  END //
DELIMITER ;

CALL patch_user();
DROP PROCEDURE IF EXISTS patch_user;