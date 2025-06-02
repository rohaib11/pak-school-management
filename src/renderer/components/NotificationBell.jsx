import { useState, useRef, useEffect } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'

const notifications = [
  { id: 1, message: 'Zainab Ali’s birthday today 🎂', time: 'Today' },
  { id: 2, message: 'Unmarked attendance: Class 8C', time: '2 hours ago' },
  { id: 3, message: 'Fee reminder for Ahmed Raza (Class 6A)', time: '1 day ago' },
]

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-3 font-semibold text-gray-800 dark:text-gray-100">Notifications</div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {notifications.map((note) => (
              <li key={note.id} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                <div>{note.message}</div>
                <div className="text-xs text-gray-500">{note.time}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
