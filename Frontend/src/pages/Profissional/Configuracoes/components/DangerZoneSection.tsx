import React from 'react'
import { Trash2 } from 'lucide-react'

const DangerZoneSection: React.FC = () => {
  return (
    <div className='rounded-xl border border-red-100 bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-lg font-bold text-red-600'>Zona de Perigo</h2>
      <p className='mb-6 text-sm text-gray-600'>
        Essas ações são permanentes e não podem ser desfeitas.
      </p>
      <button className='flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 font-medium text-red-600 hover:bg-red-50'>
        <Trash2 className='h-4 w-4' />
        Excluir Conta
      </button>
    </div>
  )
}

export default DangerZoneSection
