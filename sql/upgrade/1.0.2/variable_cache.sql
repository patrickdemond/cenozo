SELECT "Adding new variable_cache table" AS "";

CREATE TABLE IF NOT EXISTS variable_cache (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  update_timestamp TIMESTAMP NOT NULL,
  create_timestamp TIMESTAMP NOT NULL,
  participant_id INT UNSIGNED NOT NULL,
  variable VARCHAR(255) NOT NULL,
  value VARCHAR(255) NULL DEFAULT NULL,
  expiry DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX fk_participant_id (participant_id ASC),
  INDEX dk_variable (variable ASC),
  UNIQUE INDEX uq_participant_id_variable (participant_id ASC, variable ASC),
  CONSTRAINT fk_variable_cache_participant_id
    FOREIGN KEY (participant_id)
    REFERENCES participant (id)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
