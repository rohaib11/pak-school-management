import { Menu } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export default function UserMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
        Admin
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-100`}
              >
                View Profile
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-100`}
              >
                Change Password
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } block px-4 py-2 text-sm text-red-600 dark:text-red-400`}
              >
                Logout
              </a>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  )
}
