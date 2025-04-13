import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export default function CustomDropdown({ id, value, onChange, options = [], placeholder = 'Select...' }) {
  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder

  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button className="inline-flex w-full justify-between items-center rounded-md bg-[var(--color-inner-card)] px-4 py-2 text-sm text-[var(--color-text)] shadow-sm ring-1 ring-inset ring-[var(--color-muted)] hover:bg-[var(--color-muted-hover)] focus:outline-none">
        {selectedLabel}
        <ChevronDownIcon className="ml-2 h-5 w-5 text-[var(--color-muted-text)]" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-10 mt-2 w-full origin-top-right rounded-md bg-[var(--color-inner-card)] shadow-lg ring-1 ring-black/5 focus:outline-none">
          {options.map((option) => (
            <Menu.Item key={option.value}>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => onChange(option.value)}
                  className={`${
                    active ? 'bg-[var(--color-muted-hover)]' : ''
                  } block w-full px-4 py-2 text-left text-sm text-[var(--color-text)]`}
                >
                  {option.label}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
