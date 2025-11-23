import React from 'react'
import { Palette } from 'lucide-react'

const AppearanceSection: React.FC = () => {
  return (
    <div className='rounded-xl border bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-2 border-b pb-4'>
        <Palette className='h-5 w-5 text-gray-500' />
        <h2 className='text-lg font-bold text-gray-800'>Aparência</h2>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Tema</label>
          <select className='w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-green-500 focus:outline-none'>
            <option>Claro</option>
            <option>Escuro</option>
            <option>Sistema</option>
          </select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Idioma</label>
          <select className='w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-green-500 focus:outline-none'>
            <option>Português (BR)</option>
            <option>English (US)</option>
            <option>Español</option>
          </select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>
            Fuso Horário
          </label>
          <select className='w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-green-500 focus:outline-none'>
            <option>São Paulo (GMT-3)</option>
            <option>New York (GMT-5)</option>
            <option>London (GMT+0)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default AppearanceSection
