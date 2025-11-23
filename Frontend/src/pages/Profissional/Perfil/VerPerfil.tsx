import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { obterPerfilProfissional } from '../../../api/protected/axiosPerfil'
import type { Profissional } from '../../../api/protected/axiosProfissionais'
import {
  FaPhoneAlt,
  FaEnvelope,
  FaLinkedin,
  FaUniversity,
  FaMapMarkerAlt,
} from 'react-icons/fa'
import Header from '../../../components/Header'

export default function PerfilProfissional() {
  const [perfil, setPerfil] = useState<Profissional | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()

  useEffect(() => {
    let profId: number | null = null
    if (id) {
      profId = Number(id)
    } else {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setErro('Usuário não autenticado')
        setLoading(false)
        return
      }
      const user = JSON.parse(userStr)
      profId = user.id
    }
    if (!profId || isNaN(profId)) {
      setErro('ID de profissional inválido')
      setLoading(false)
      return
    }

    console.log('=== DEBUG PERFIL ===')
    console.log('Buscando perfil para usuário ID:', profId)

    obterPerfilProfissional(profId)
      .then((data) => {
        console.log('Dados do perfil recebidos:', data)
        console.log('perfil.redes:', data?.redes)
        console.log('perfil.locais:', data?.locais)
        setPerfil(data)
        setLoading(false)
      })
      .catch((e) => {
        console.error('Erro ao buscar perfil:', e)
        setErro(e.message)
        setLoading(false)
      })
  }, [id])

  const irParaPerfil = () => {
    navigate('/profissional/perfil/editar')
  }

  if (loading)
    return <div className='p-8 text-center'>Carregando perfil...</div>
  if (erro) return <div className='p-8 text-center text-red-500'>{erro}</div>
  if (!perfil)
    return (
      <div className='p-8 text-center text-gray-500'>
        Perfil não encontrado.
      </div>
    )

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header alinhado com outros layouts */}
      <Header
        title='Ver Perfil'
        description='Visualize os dados do profissional'
        showSearch={false}
      />

      <div className='flex justify-center p-6'>
        {/* Card */}
        <div className='w-full max-w-3xl rounded-2xl bg-white p-6 shadow-md sm:p-10'>
          {/* Foto + Nome */}
          <div className='flex flex-col items-center'>
            <img
              src={perfil.fotoPerfilUrl || '/conectatea.svg'}
              alt='Foto de Perfil'
              className='h-32 w-32 rounded-full border-4 border-green-500 object-cover'
            />
            <h2 className='mt-4 text-2xl font-bold text-gray-900 sm:text-3xl'>
              {perfil.nome || perfil.usuario?.nome || 'Sem nome'}
            </h2>
            <p className='text-lg font-medium text-green-600'>
              {perfil.especialidade && perfil.especialidade.trim() !== '' ? (
                <>{perfil.especialidade}</>
              ) : (
                <span title='Informe sua especialidade profissional, ex: Psicólogo Clínico, Terapeuta Ocupacional, Fonoaudiólogo...'>
                  Especialidade{' '}
                  <span className='text-sm text-gray-400'>
                    (ex: Psicólogo Clínico)
                  </span>
                </span>
              )}
            </p>
            <span className='mt-1 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700'>
              # {perfil.codigoIdentificacao || ''}
            </span>
          </div>

          {/* Conteúdo */}
          <div className='mt-8 space-y-6'>
            {/* Formação */}
            <div>
              <h2 className='text-lg font-semibold text-gray-800'>
                Formação Acadêmica
              </h2>
              <div className='mt-2 flex items-center text-gray-700'>
                <FaUniversity className='mr-2 text-green-600' />
                <span>{perfil.formacaoAcademica || ''}</span>
              </div>
            </div>

            {/* Sobre */}
            <div>
              <h2 className='text-lg font-semibold text-gray-800'>Sobre</h2>
              <p className='mt-2 leading-relaxed text-gray-600'>
                {perfil.sobre || ''}
              </p>
            </div>

            {/* Contato */}
            <div>
              <h2 className='text-lg font-semibold text-gray-800'>
                Informações de Contato
              </h2>
              <div className='mt-2 space-y-2 text-gray-700'>
                <div className='flex items-center'>
                  <FaPhoneAlt className='mr-2 text-green-600' />
                  <span>
                    {perfil.telefone || perfil.usuario?.telefone || ''}
                  </span>
                </div>
                <div className='flex items-center'>
                  <FaEnvelope className='mr-2 text-green-600' />
                  <span>{perfil.email || perfil.usuario?.email || ''}</span>
                </div>
                <div className='flex items-center'>
                  <FaLinkedin className='mr-2 text-green-600' />
                  {perfil.redes?.linkedin ? (
                    <a
                      href={perfil.redes.linkedin}
                      target='_blank'
                      rel='noreferrer'
                      className='hover:underline'
                    >
                      {perfil.redes.linkedin}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Locais de Atendimento */}
            <div>
              <h2 className='text-lg font-semibold text-gray-800'>
                Locais de Atendimento
              </h2>
              {perfil.locais && perfil.locais.length > 0 ? (
                <ul className='mt-2 space-y-1'>
                  {perfil.locais.map((local, idx) => (
                    <li
                      key={idx}
                      className='flex items-center text-gray-700'
                    >
                      <FaMapMarkerAlt className='mr-2 text-green-600' />
                      <span className='font-medium'>{local.nome || '-'}</span>
                      {local.cidade && (
                        <span className='ml-2 text-gray-400'>
                          {local.cidade}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='mt-2 flex items-center text-gray-700'>
                  <FaMapMarkerAlt className='mr-2 text-green-600' />
                  <span>-</span>
                </div>
              )}
            </div>
          </div>

          {/* Botão Editar */}
          <div className='mt-8 flex justify-center'>
            {(!id || (perfil && perfil.id && String(perfil.id) === id)) && (
              <button
                onClick={irParaPerfil}
                className='rounded-lg bg-green-600 px-6 py-2 text-white shadow-md transition hover:bg-green-700'
              >
                Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
