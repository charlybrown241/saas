'use client';

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

export default function ScheduleCalendar({ events }) {
  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      locale={frLocale}
      slotMinTime="06:00:00"
      slotMaxTime="23:00:00"
      allDaySlot={false}
      events={events}
      height="600px"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,timeGridDay'
      }}
    />
  );
}