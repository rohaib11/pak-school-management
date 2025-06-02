const topStudents = [
  {
    id: 1,
    name: 'Ali Khan',
    class: 'Class 8A',
    gpa: '96%',
    avatar: `https://ui-avatars.com/api/?name=Ali+Khan&background=0D8ABC&color=fff`
  },
  {
    id: 2,
    name: 'Zainab Ali',
    class: 'Class 7B',
    gpa: '94%',
    avatar: `https://ui-avatars.com/api/?name=Zainab+Ali&background=8B5CF6&color=fff`
  },
  {
    id: 3,
    name: 'Ahmed Raza',
    class: 'Class 6C',
    gpa: '92%',
    avatar: `https://ui-avatars.com/api/?name=Ahmed+Raza&background=10B981&color=fff`
  },
]

const TopStudents = () => (
  <div className="card">
    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Top Performing Students</h2>
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {topStudents.map(student => (
        <li key={student.id} className="py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img className="h-10 w-10 rounded-full" src={student.avatar} alt={student.name} />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{student.class}</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{student.gpa}</span>
        </li>
      ))}
    </ul>
  </div>
)

export default TopStudents
