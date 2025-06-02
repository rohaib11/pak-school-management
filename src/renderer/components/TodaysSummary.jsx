const data = [
  { label: 'Present Today', value: 847 },
  { label: 'New Admissions', value: 5 },
  { label: 'Fees Collected', value: 'PKR 85,000' },
  { label: 'Pending Dues', value: 'PKR 12,000' }
]

const TodaysSummary = () => (
  <div className="card">
    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Today’s Summary</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <div key={index} className="rounded-md bg-blue-50 dark:bg-blue-900/10 px-4 py-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{item.label}</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
)

export default TodaysSummary
