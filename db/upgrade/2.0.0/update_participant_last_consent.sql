SELECT "Creating new update_participant_last_consent procedure" AS "";

DROP procedure IF EXISTS update_participant_last_consent;

DELIMITER $$
CREATE PROCEDURE update_participant_last_consent(IN proc_participant_id INT(10) UNSIGNED)
BEGIN
  REPLACE INTO participant_last_consent( participant_id, consent_id )
  SELECT participant.id, consent.id
  FROM participant
  LEFT JOIN consent ON participant.id = consent.participant_id
  AND consent.date <=> (
    SELECT MAX( date )
    FROM consent
    WHERE participant.id = consent.participant_id
    GROUP BY consent.participant_id
    LIMIT 1
  )
  WHERE participant.id = proc_participant_id;
END$$

DELIMITER ;