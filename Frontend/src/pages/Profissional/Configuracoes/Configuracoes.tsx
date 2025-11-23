import React from 'react'
import { Save } from 'lucide-react'
import ProfileSection from './components/ProfileSection'
import AppearanceSection from './components/AppearanceSection'
import NotificationsSection from './components/NotificationsSection'
import PrivacySecuritySection from './components/PrivacySecuritySection'
import SupportSection from './components/SupportSection'
import DangerZoneSection from './components/DangerZoneSection'

import Header from '../../../components/Header'

const Configuracoes: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <Header
        title='Configurações'
        description='Gerencie suas preferências e configurações da conta'
        showSearch={false}
        showNotifications={false}
        showProfile={false}
      >
        <button className='flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600'>
          <Save className='h-5 w-5' />
          Salvar Alterações
        </button>
      </Header>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Coluna Principal - Perfil */}
        <div className='space-y-8 lg:col-span-2'>
          <ProfileSection />
          <NotificationsSection />
          <PrivacySecuritySection />
        </div>

        {/* Coluna Lateral - Outras Configurações */}
        <div className='space-y-8'>
          <AppearanceSection />
          <SupportSection />
          <DangerZoneSection />
        </div>
      </div>
    </div>
  )
}

export default Configuracoes
