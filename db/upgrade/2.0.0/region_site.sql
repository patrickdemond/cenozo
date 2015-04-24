DROP PROCEDURE IF EXISTS patch_region_site;
DELIMITER //
CREATE PROCEDURE patch_region_site()
  BEGIN

    SELECT "Removing service_id column from region_site table" AS "";

    SET @test = (
      SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = "region_site"
      AND COLUMN_NAME = "service_id" );
    IF @test = 1 THEN
      -- drop foreign keys, key and column
      ALTER TABLE region_site
      DROP FOREIGN KEY fk_region_site_service_id,
      DROP KEY fk_service_id,
      DROP COLUMN service_id,
      DROP KEY uq_service_id_region_id_language_id,
      ADD UNIQUE KEY uq_site_id_region_id_language_id (site_id ASC, region_id ASC, language_id ASC),
      MODIFY COLUMN site_id INT(10) UNSIGNED NOT NULL AFTER create_timestamp;
    END IF;

  END //
DELIMITER ;

CALL patch_region_site();
DROP PROCEDURE IF EXISTS patch_region_site;

SELECT "Adding new triggers to region_site table" AS "";

-- create trigger to enforce application-region-language pseudo unique key
DELIMITER //
DROP TRIGGER IF EXISTS region_site_BEFORE_INSERT //
CREATE TRIGGER region_site_BEFORE_INSERT
BEFORE INSERT ON region_site FOR EACH ROW
BEGIN
  SET @test = (
    SELECT COUNT(*) FROM region_site
    JOIN site ON region_site.site_id = site.id
    WHERE region_site.region_id = NEW.region_id
    AND region_site.language_id = NEW.language_id
    AND site.application_id = (
      SELECT application_id FROM site
      WHERE id = NEW.site_id
    )
  );
  IF @test > 0 THEN
    -- trigger unique key conflict
    SET @sql = CONCAT(
      "Duplicate entry '",
      NEW.site_id, "-", NEW.region_id, "-", NEW.language_id,
      "' for key 'uq_site_id_region_id_language_id'"
    );
    SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = @sql, MYSQL_ERRNO = 1062;
  END IF;
END;//

DROP TRIGGER IF EXISTS region_site_BEFORE_UPDATE //
CREATE TRIGGER region_site_BEFORE_UPDATE
BEFORE UPDATE ON region_site FOR EACH ROW
BEGIN
  SET @test = (
    SELECT COUNT(*) FROM region_site
    JOIN site ON region_site.site_id = site.id
    WHERE region_site.region_id = NEW.region_id
    AND region_site.language_id = NEW.language_id
    AND site.application_id = (
      SELECT application_id FROM site
      WHERE id = NEW.site_id
    )
    AND region_site.id != NEW.id
  );
  IF @test > 0 THEN
    -- trigger unique key conflict
    SET @sql = CONCAT(
      "Duplicate entry '",
      NEW.site_id, "-", NEW.region_id, "-", NEW.language_id,
      "' for key 'uq_site_id_region_id_language_id'"
    );
    SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = @sql, MYSQL_ERRNO = 1062;
  END IF;
END;//

DELIMITER ;
