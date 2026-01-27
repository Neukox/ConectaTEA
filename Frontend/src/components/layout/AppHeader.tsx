import { IoMdMenu } from 'react-icons/io'
import { Button } from '../ui'
import { useSidebar } from '../ui/sidebar'
import { UserDropdown } from '~/features/User'
import { Bell } from 'lucide-react'

export default function AppHeader() {
  const { setOpenMobile } = useSidebar()

  return (
    <header className='sticky top-0 z-10 flex h-14.25 shrink-0 items-center justify-between gap-2 border-b bg-white px-4 py-2 md:justify-end'>
      <div className='md:hidden flex gap-2'>
        <Button
          asChild
          variant='ghost'
          size='icon'
          onClick={() => setOpenMobile(true)}
          className='p-1'
        >
          <IoMdMenu className='size-4 font-light' />
        </Button>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white'>
            C
          </div>
          <span className='text-sidebar-foreground font-semibold'>
            ConectaTEA
          </span>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <button className='relative rounded-full p-2 hover:bg-gray-100'>
          <Bell className='h-6 w-6 text-gray-500' />
          <span className='absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500'></span>
        </button>

        <UserDropdown />
      </div>
    </header>
  )
}
