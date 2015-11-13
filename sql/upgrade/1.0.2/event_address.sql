SELECT "Creating new event_address table" AS "";

CREATE TABLE IF NOT EXISTS event_address (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  update_timestamp TIMESTAMP NOT NULL,
  create_timestamp TIMESTAMP NOT NULL,
  event_id INT UNSIGNED NOT NULL,
  address_id INT UNSIGNED NULL,
  address1 VARCHAR(512) NOT NULL,
  address2 VARCHAR(512) NULL DEFAULT NULL,
  city VARCHAR(100) NOT NULL,
  region_id INT UNSIGNED NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  PRIMARY KEY (id),
  INDEX fk_event_id (event_id ASC),
  INDEX fk_address_id (address_id ASC),
  INDEX fk_region_id (region_id ASC),
  CONSTRAINT fk_event_address_event_id
    FOREIGN KEY (event_id)
    REFERENCES event (id)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT fk_event_address_address_id
    FOREIGN KEY (address_id)
    REFERENCES address (id)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  CONSTRAINT fk_event_address_region_id
    FOREIGN KEY (region_id)
    REFERENCES region (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
