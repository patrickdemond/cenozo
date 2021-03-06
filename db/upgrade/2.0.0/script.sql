DROP PROCEDURE IF EXISTS patch_script;
  DELIMITER //
  CREATE PROCEDURE patch_script()
  BEGIN

    SELECT "Creating new script table" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "script" );
    IF @test = 0 THEN

      CREATE TABLE IF NOT EXISTS script (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        update_timestamp TIMESTAMP NOT NULL,
        create_timestamp TIMESTAMP NOT NULL,
        name VARCHAR(255) NOT NULL,
        started_event_type_id INT UNSIGNED NULL,
        finished_event_type_id INT UNSIGNED NULL,
        sid INT NOT NULL,
        repeated TINYINT(1) NOT NULL DEFAULT 0,
        withdraw TINYINT(1) NOT NULL DEFAULT 0,
        description TEXT NULL,
        PRIMARY KEY (id),
        INDEX fk_started_event_type_id (started_event_type_id ASC),
        INDEX fk_finished_event_type_id (finished_event_type_id ASC),
        UNIQUE INDEX uq_name (name ASC),
        UNIQUE INDEX uq_sid (sid ASC),
        CONSTRAINT fk_script_started_event_type_id
          FOREIGN KEY (started_event_type_id)
          REFERENCES event_type (id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        CONSTRAINT fk_script_finished_event_type_id
          FOREIGN KEY (finished_event_type_id)
          REFERENCES event_type (id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION)
      ENGINE = InnoDB;
    END IF;

  END //
DELIMITER ;

-- now call the PROCEDURE and remove the PROCEDURE
CALL patch_script();
DROP PROCEDURE IF EXISTS patch_script;
