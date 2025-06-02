import { BellIcon } from '@heroicons/react/24/outline'

const notifications = [
  { id: 1, message: 'Fee due reminder for Class 5B', time: '10 mins ago' },
  { id: 2, message: 'Birthday: Zainab Ali (Class 7B)', time: 'Today' },
  { id: 3, message: 'Unmarked attendance for Class 9A', time: '1 hour ago' },
]

export default function Notifications() {
  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <BellIcon className="h-5 w-5 text-yellow-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notifications</h2>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((note) => (
          <li key={note.id} className="py-2">
            <div className="text-sm text-gray-800 dark:text-gray-200">{note.message}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{note.time}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
