define( {
  subject: 'event_type',
  identifier: { column: 'name' },
  name: {
    singular: 'event type',
    plural: 'event types',
    possessive: 'event type\'s',
    pluralPossessive: 'event types\''
  },
  inputList: {
    name: {
      title: 'Name',
      type: 'string'
    },
    description: {
      title: 'Description',
      type: 'string'
    }
  },
  columnList: {
    name: { title: 'Name' },
    event_count: {
      title: 'Events',
      type: 'number'
    },
    description: {
      title: 'Description',
      align: 'left'
    }
  },
  defaultOrder: {
    column: 'name',
    reverse: false
  }
} );
