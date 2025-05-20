// utils/insertCalendarEvents.ts
export interface GoogleCalendarEvent {
  summary: string
  start: string // ISO 8601 format (e.g., "2025-09-30T10:00:00-07:00")
  end: string   // ISO 8601 format
  location?: string
  recurrence?: string[] // e.g., ["RRULE:FREQ=WEEKLY"]
}

/**
 * Inserts an array of events into the user's primary Google Calendar.
 * Requires gapi.client to be loaded and authenticated.
 */
export async function insertCalendarEvents(events: GoogleCalendarEvent[]): Promise<void> {
  if (!window.gapi?.client?.calendar) {
    try {
      await window.gapi.client.load('calendar', 'v3')
    } catch (e) {
      console.error('❌ Failed to load gapi.client.calendar:', e)
      return
    }
  }

  for (const event of events) {
    if (!event.summary || !event.start || !event.end) {
      console.warn(`⚠️ Skipping event due to missing required fields:`, event)
      continue
    }

    const calendarEvent = {
      summary: event.summary,
      start: {
        dateTime: event.start,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: event.end,
        timeZone: 'America/Los_Angeles',
      },
      location: event.location,
      recurrence: event.recurrence,
    }

    console.log('📤 Uploading event:', calendarEvent)

    try {
      await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: calendarEvent,
      })
      console.log(`✅ Inserted: ${event.summary}`)
    } catch (err) {
      console.error(`❌ Failed to insert "${event.summary}":`, err)
    }
  }

  alert('✅ Finished uploading events.')
}
