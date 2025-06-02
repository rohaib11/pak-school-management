import { Link } from 'react-router-dom'
import { PlusIcon, CalendarDaysIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid'

const actions = [
  {
    name: 'Add Student',
    href: '/students/new',
    icon: PlusIcon,
    bg: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    name: 'Mark Attendance',
    href: '/attendance',
    icon: CalendarDaysIcon,
    bg: 'bg-green-600 hover:bg-green-700',
  },
  {
    name: 'Collect Fees',
    href: '/fees',
    icon: CurrencyRupeeIcon,
    bg: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link
          key={action.name}
          to={action.href}
          className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-white shadow ${action.bg}`}
        >
          <action.icon className="h-5 w-5 mr-2" />
          {action.name}
        </Link>
      ))}
    </div>
  )
}
