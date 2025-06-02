// src/renderer/pages/ForgotPassword.jsx
console.log("ForgotPassword page loaded")

import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Password reset functionality will go here.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
