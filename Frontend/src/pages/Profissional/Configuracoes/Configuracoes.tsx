import React from 'react'
import { Save } from 'lucide-react'
import ProfileSection from './components/ProfileSection'
import AppearanceSection from './components/AppearanceSection'
import NotificationsSection from './components/NotificationsSection'
import PrivacySecuritySection from './components/PrivacySecuritySection'
import SupportSection from './components/SupportSection'
import DangerZoneSection from './components/DangerZoneSection'

import Header from '../../../components/layout/Header'
import { PageLayout } from '~/components/layout/PageLayout'

const Configuracoes: React.FC = () => {
  return (
    <PageLayout>
      <Header
        title='Configurações'
        description='Gerencie suas preferências e configurações da conta'
        className='xs:flex-row xs:items-center flex-col justify-between gap-2'
      >
        <button className='xs:flex-initial flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600'>
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
    </PageLayout>
  )
}

export default Configuracoes
