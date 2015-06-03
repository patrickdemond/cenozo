define( {
  subject: 'event',
  name: {
    singular: 'event',
    plural: 'events',
    possessive: 'event\'s',
    pluralPossessive: 'events\''
  },
  inputList: {
    event_type_id: {
      title: 'Event',
      type: 'enum'
    },
    datetime: {
      title: 'Date & Time',
      type: 'datetimesecond'
    }
  },
  columnList: {
    event: {
      column: 'event_type.name',
      title: 'Event'
    },
    datetime: {
      title: 'Date & Time',
      filter: 'cnMomentDate:"MMM D, YYYY @ HH:mm:ss"'
    }
  },
  defaultOrder: {
    column: 'datetime',
    reverse: true
  }
} );