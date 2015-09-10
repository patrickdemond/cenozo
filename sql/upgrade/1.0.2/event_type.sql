UPDATE event_type
SET name = "mailed baseline reminder",
    description = "Participant mailed a reminder about their upcoming baseline interview."
WHERE name = "package mailed";

INSERT IGNORE INTO event_type( name, description ) VALUES
( "mailed follow-up-1 reminder", "Participant mailed a reminder about their upcoming follow-up-1 interview." );
