import { CalendarDaysIcon } from '@heroicons/react/24/outline'

const events = [
  { date: '2025-05-20', title: 'Mid-Term Exams Begin' },
  { date: '2025-05-25', title: 'Parent Teacher Meeting' },
  { date: '2025-06-01', title: 'Annual Sports Day' },
  { date: '2025-06-15', title: 'Result Announcement' }
]

export default function UpcomingEvents() {
  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <CalendarDaysIcon className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Upcoming Events</h2>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {events.map((event, index) => (
          <li key={index} className="py-2 flex justify-between items-center">
            <span className="text-sm text-gray-800 dark:text-gray-200">{event.title}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(event.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
