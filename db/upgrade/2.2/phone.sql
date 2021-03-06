SELECT "Adding new triggers to phone table" AS "";

DELIMITER $$

DROP TRIGGER IF EXISTS phone_AFTER_INSERT $$
CREATE DEFINER = CURRENT_USER TRIGGER phone_AFTER_INSERT AFTER INSERT ON phone FOR EACH ROW
BEGIN
  IF NEW.participant_id IS NOT NULL THEN
    CALL contact_changed( NEW.participant_id );
  END IF;
END$$

DROP TRIGGER IF EXISTS phone_AFTER_UPDATE $$
CREATE DEFINER = CURRENT_USER TRIGGER phone_AFTER_UPDATE AFTER UPDATE ON phone FOR EACH ROW
BEGIN
  IF NEW.participant_id IS NOT NULL THEN
    CALL contact_changed( NEW.participant_id );
  END IF;
END$$

DROP TRIGGER IF EXISTS phone_AFTER_DELETE $$
CREATE DEFINER = CURRENT_USER TRIGGER phone_AFTER_DELETE AFTER DELETE ON phone FOR EACH ROW
BEGIN
  IF OLD.participant_id IS NOT NULL THEN
    CALL contact_changed( OLD.participant_id );
  END IF;
END$$

DELIMITER ;
