CREATE TABLE IF NOT EXISTS consent_type (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  update_timestamp TIMESTAMP NOT NULL,
  create_timestamp TIMESTAMP NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX uq_name (name ASC))
ENGINE = InnoDB;

SELECT "Populating consent_type table with entries" AS "";

INSERT IGNORE INTO consent_type( name, description ) VALUES
( "participation", "Consent to participate in the study." ),
( "draw blood", "Consent to draw blood." ),
( "take urine", "Consent to take urine." ),
( "continue draw blood", "Consent to continue to draw blood in the event that the participant uses a proxy decision maker." ),
( "continue physical tests", "Consent to continue to take physical tests in the event that the participant uses a proxy decision maker." ),
( "continue questionnaires", "Consent to continue to answer the research questions by an interviewer behalf of the participant." ),
( "HIN access", "Consent to grant CLSA access to the participant's health insurance number." ),
( "HIN extended access", "Consent to grant CLSA extended linkage access to the participant\'s health insurance number." ),
( "HIN future access", "Consent to grant CLSA future linkage access to the participant\'s health insurance number in the event that they use a proxy decision maker." );

SELECT "Adding new triggers to consent_type table" AS "";

DELIMITER $$

DROP TRIGGER IF EXISTS consent_type_AFTER_INSERT $$
CREATE DEFINER = CURRENT_USER TRIGGER consent_type_AFTER_INSERT AFTER INSERT ON consent_type FOR EACH ROW
BEGIN
  INSERT INTO participant_last_consent( participant_id, consent_type_id, consent_id )
  SELECT participant.id, NEW.id, NULL 
  FROM participant;
  INSERT INTO participant_last_written_consent( participant_id, consent_type_id, consent_id )
  SELECT participant.id, NEW.id, NULL 
  FROM participant;
END;$$

DELIMITER ;
