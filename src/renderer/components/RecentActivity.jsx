const activities = [
  { id: 1, type: 'student', message: 'Added student Ali Khan to Class 3A', time: '2 minutes ago' },
  { id: 2, type: 'fee', message: 'Collected fee from Zainab Ali (Class 4B)', time: '15 minutes ago' },
  { id: 3, type: 'attendance', message: 'Marked attendance for Class 2', time: '30 minutes ago' },
]

export default function RecentActivity() {
  return (
    <div className="card">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.map((activity) => (
          <li key={activity.id} className="py-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
