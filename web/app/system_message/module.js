define( {
  subject: 'system_message',
  name: {
    singular: 'system message',
    plural: 'system messages',
    possessive: 'system message\'s',
    pluralPossessive: 'system messages\''
  },
  inputList: {
    application_id: {
      column: 'system_message.application_id',
      title: 'Application',
      type: 'enum',
      help: 'Leaving the site blank will show the message across all applications.'
    },
    site_id: {
      title: 'Site',
      type: 'enum', // TODO: Blank for all sites //
      help: 'Leaving the site blank will show the message across all sites.  If application is blank then this ' +
            'will be ignored.'
    },
    role_id: {
      title: 'Role',
      type: 'enum', // TODO: Blank for all roles //
      help: 'Leaving the site blank will show the message across all roles.'
    },
    title: {
      column: 'system_message.title',
      title: 'Title',
      type: 'string'
    },
    note: {
      title: 'Note',
      type: 'text'
    }
  },
  columnList: {
    title: {
      column: 'system_message.title',
      title: 'Title'
    },
    application: {
      column: 'application.title',
      title: 'Application'
    },
    site: {
      column: 'site.name',
      title: 'Site'
    },
    role: {
      column: 'role.name',
      title: 'Role'
    },
    expiry: {
      title: 'Expiry',
      filter: 'cnMomentDate:"MMM D, YYYY @ HH:mm"'
    }
  },
  defaultOrder: {
    column: 'title',
    reverse: false
  }
} );
