DROP PROCEDURE IF EXISTS patch_application_has_role;
DELIMITER //
CREATE PROCEDURE patch_application_has_role()
  BEGIN

    SELECT "Renaming service_has_role table to application_has_role" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "application_has_role" );
    IF @test = 0 THEN
      -- rename table
      RENAME TABLE service_has_role TO application_has_role;

      -- drop keys
      ALTER TABLE application_has_role
      DROP FOREIGN KEY fk_service_has_role_service_id,
      DROP FOREIGN KEY fk_service_has_role_role_id;

      -- rename columns
      ALTER TABLE application_has_role
      CHANGE service_id application_id INT UNSIGNED NOT NULL;

      -- rename keys
      ALTER TABLE application_has_role
      DROP KEY fk_service_id,
      ADD KEY fk_application_id (application_id);

      ALTER TABLE application_has_role
      ADD CONSTRAINT fk_application_has_role_application_id
      FOREIGN KEY (application_id) REFERENCES application (id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;

      ALTER TABLE application_has_role
      ADD CONSTRAINT fk_application_has_role_role_id
      FOREIGN KEY (role_id) REFERENCES role (id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;

  END //
DELIMITER ;

CALL patch_application_has_role();
DROP PROCEDURE IF EXISTS patch_application_has_role;