import SummaryCard from '~/components/common/SummaryCard'
import { IoMdTrendingUp } from 'react-icons/io'
import { LuCircleCheckBig, LuGoal } from 'react-icons/lu'
import { statsCards as data } from '../data/mockData'
import { FaChild } from 'react-icons/fa6'

export function ProgressoResumo() {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
      <SummaryCard
        sub='Progresso Médio'
        value={`${data.media_progresso}%`}
        icon={IoMdTrendingUp}
        iconColor='green'
        color='green'
      />
      <SummaryCard
        sub='Metas Ativas'
        value={data.metas_ativas}
        icon={LuGoal}
        iconColor='blue'
        color='blue'
      />
      <SummaryCard
        sub='Metas Concluídas'
        value={data.metas_concluidas}
        icon={LuCircleCheckBig}
        iconColor='violet'
        color='violet'
      />
      <SummaryCard
        sub='Crianças Ativas'
        value={data.criancas_ativas}
        icon={FaChild}
        iconColor='orange'
        color='orange'
      />
    </div>
  )
}
