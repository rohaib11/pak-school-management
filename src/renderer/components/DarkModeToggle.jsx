import { useDarkMode } from '../context/DarkModeContext'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import { useEffect, useState } from 'react'

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Avoid hydration mismatch in SSR
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex items-center">
      <DarkModeSwitch
        checked={darkMode}
        onChange={toggleDarkMode}
        size={22}
        sunColor="#facc15"
        moonColor="#60a5fa"
      />
    </div>
  )
}

export default DarkModeToggle
