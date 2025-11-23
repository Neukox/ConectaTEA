import React from 'react'
import { HelpCircle, Mail, Download } from 'lucide-react'

const SupportSection: React.FC = () => {
  return (
    <div className='rounded-xl border bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-2 border-b pb-4'>
        <HelpCircle className='h-5 w-5 text-gray-500' />
        <h2 className='text-lg font-bold text-gray-800'>Suporte</h2>
      </div>

      <div className='space-y-3'>
        <button className='flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'>
          <Mail className='h-5 w-5 text-gray-500' />
          <span className='font-medium text-gray-700'>Contatar Suporte</span>
        </button>

        <button className='flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'>
          <HelpCircle className='h-5 w-5 text-gray-500' />
          <span className='font-medium text-gray-700'>Central de Ajuda</span>
        </button>

        <button className='flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'>
          <Download className='h-5 w-5 text-gray-500' />
          <span className='font-medium text-gray-700'>Baixar Dados</span>
        </button>
      </div>
    </div>
  )
}

export default SupportSection
