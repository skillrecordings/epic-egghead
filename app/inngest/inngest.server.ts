import {EventSchemas, Inngest} from 'inngest'

// Create a client to send and receive events
type Events = {}
export const inngest = new Inngest({
  id: 'epic-egghead',
  schemas: new EventSchemas().fromRecord<Events>(),
})
