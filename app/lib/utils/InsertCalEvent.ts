/* eslint-disable */

export interface GoogleCalendarEvent {
  summary: string
  start: string // ISO 8601 format
  end: string   // ISO 8601 format
  location?: string
  recurrence?: string[] // e.g., ["RRULE:FREQ=WEEKLY"]
}
/**
 * Inserts an array of events into the user's primary Google Calendar.
 * Requires gapi.client to be loaded and authenticated.
 */
export async function insertCalendarEvents(events: GoogleCalendarEvent[]): Promise<void> {
  const gapiClient = window.gapi?.client as any // 👈 TEMP cast for calendar access

  if (!gapiClient?.calendar) {
    try {
      await gapiClient.load('calendar', 'v3')
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
      await gapiClient.calendar.events.insert({
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
