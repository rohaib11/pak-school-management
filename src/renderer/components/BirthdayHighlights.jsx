import { CakeIcon } from '@heroicons/react/24/solid'

const birthdayList = [
  { name: 'Fatima Ali', role: 'Student', class: 'Class 4' },
  { name: 'Mr. Ahmed Raza', role: 'Teacher', subject: 'Mathematics' },
]

export default function BirthdayHighlights() {
  if (birthdayList.length === 0) return null

  return (
    <div className="card">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">🎂 Birthdays Today</h2>
      <ul className="space-y-2">
        {birthdayList.map((person, idx) => (
          <li key={idx} className="flex items-center">
            <CakeIcon className="h-5 w-5 text-pink-500 mr-2" />
            <span className="text-sm">
              <strong>{person.name}</strong> – {person.role} {person.class || person.subject ? `(${person.class || person.subject})` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
