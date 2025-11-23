import React from 'react'
import { User, Camera } from 'lucide-react'

const ProfileSection: React.FC = () => {
  return (
    <div className='rounded-xl border bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-2 border-b pb-4'>
        <User className='h-5 w-5 text-gray-500' />
        <h2 className='text-lg font-bold text-gray-800'>Perfil</h2>
      </div>

      <div className='mb-8 flex items-center gap-4'>
        <div className='relative'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-600'>
            MS
          </div>
          <button className='absolute right-0 bottom-0 rounded-full bg-gray-800 p-1.5 text-white hover:bg-gray-700'>
            <Camera className='h-4 w-4' />
          </button>
        </div>
        <div>
          <h3 className='text-xl font-bold text-gray-800'>Maria Silva</h3>
          <div className='flex items-center gap-2'>
            <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700'>
              Profissional
            </span>
            <span className='text-sm text-gray-500'>
              Membro desde Janeiro 2024
            </span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Nome</label>
          <input
            type='text'
            defaultValue='Maria'
            className='w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-green-500 focus:outline-none'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Sobrenome</label>
          <input
            type='text'
            defaultValue='Silva'
            className='w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-green-500 focus:outline-none'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Email</label>
          <input
            type='email'
            defaultValue='maria.silva@email.com'
            className='w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-green-500 focus:outline-none'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Telefone</label>
          <input
            type='tel'
            defaultValue='(11) 99999-1234'
            className='w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-green-500 focus:outline-none'
          />
        </div>
        <div className='space-y-2 md:col-span-2'>
          <label className='text-sm font-medium text-gray-700'>Sobre</label>
          <textarea
            rows={3}
            defaultValue='Profissional dedicada buscando o melhor desenvolvimento para meus pacientes.'
            className='w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-green-500 focus:outline-none'
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileSection
