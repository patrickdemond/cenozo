SELECT "Adding new triggers to event table" AS "";

DELIMITER $$

DROP TRIGGER IF EXISTS event_AFTER_INSERT $$
CREATE DEFINER = CURRENT_USER TRIGGER event_AFTER_INSERT AFTER INSERT ON event FOR EACH ROW
BEGIN
  SET @test = ( SELECT record_address FROM event_type WHERE id = NEW.event_type_id );
  IF @test THEN
    INSERT INTO event_address( event_id, address_id, address1, address2, city, region_id, postcode )
    SELECT NEW.id, address.id, address1, address2, city, region_id, postcode
    FROM participant_primary_address
    JOIN address ON participant_primary_address.address_id = address.id
    WHERE participant_primary_address.participant_id = NEW.participant_id;
  END IF;
END;$$

DELIMITER ;
