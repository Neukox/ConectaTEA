import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { atualizarMeuPerfilProfissional, obterMeuPerfilProfissional, type AtualizarProfissionalRequest } from '~/api/protected/axiosProfissionais'
import { getApiErrorMessage } from '~/api/errors'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import { PageLayout } from '~/components/layout'
import Header from '~/components/layout/Header'
import { atualizarMeuUsuario, obterMeuUsuario, type AtualizarUsuarioRequest } from '~/api/protected/axiosUsuarios'
import { useAuth } from '~/hooks/useAuth'

const vazio: AtualizarProfissionalRequest = {
  especialidade: '', registroProfissional: '', titulo: '', formacaoAcademica: '', sobre: '', fotoPerfilUrl: '',
}

export default function EditarPerfil() {
  const navigate = useNavigate()
  const { notificarErro, notificarSucesso } = useNotificacoesContext()
  const { setUser } = useAuth()
  const [form, setForm] = useState<AtualizarProfissionalRequest>(vazio)
  const [usuario, setUsuario] = useState<AtualizarUsuarioRequest>({ name: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void Promise.all([obterMeuPerfilProfissional(), obterMeuUsuario()]).then(([perfil, user]) => {
      setUsuario({ name: user.name, telefone: user.telefone, endereco: user.endereco })
      setForm({
      especialidade: perfil.especialidade, registroProfissional: perfil.registroProfissional,
      titulo: perfil.titulo, formacaoAcademica: perfil.formacaoAcademica,
      sobre: perfil.sobre, fotoPerfilUrl: perfil.fotoPerfilUrl,
      })
    }).catch((error) => notificarErro('Erro ao carregar perfil', getApiErrorMessage(error))).finally(() => setLoading(false))
  }, [notificarErro])

  const update = (field: keyof AtualizarProfissionalRequest, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const [updatedUser] = await Promise.all([
        atualizarMeuUsuario(usuario),
        atualizarMeuPerfilProfissional(form),
      ])
      setUser(updatedUser)
      notificarSucesso('Perfil atualizado', 'As informações profissionais foram salvas.')
      navigate('/profissional/perfil')
    } catch (error) {
      notificarErro('Erro ao atualizar perfil', getApiErrorMessage(error))
    } finally { setSaving(false) }
  }

  return <PageLayout><Header title='Editar perfil' description='Atualize seus dados profissionais' />
    {loading ? <p>Carregando...</p> : <form onSubmit={submit} className='mx-auto grid max-w-3xl gap-5 rounded-2xl bg-white p-8 shadow-sm sm:grid-cols-2'>
      <h2 className='text-lg font-bold sm:col-span-2'>Dados da conta</h2>
      <label className='grid gap-2 text-sm font-medium text-gray-700'>Nome<input required value={usuario.name} onChange={(event) => setUsuario((current) => ({ ...current, name: event.target.value }))} className='rounded-lg border border-gray-300 px-3 py-2' /></label>
      <label className='grid gap-2 text-sm font-medium text-gray-700'>Telefone<input value={usuario.telefone || ''} onChange={(event) => setUsuario((current) => ({ ...current, telefone: event.target.value }))} className='rounded-lg border border-gray-300 px-3 py-2' /></label>
      <label className='grid gap-2 text-sm font-medium text-gray-700 sm:col-span-2'>Endereço<input value={usuario.endereco || ''} onChange={(event) => setUsuario((current) => ({ ...current, endereco: event.target.value }))} className='rounded-lg border border-gray-300 px-3 py-2' /></label>
      <h2 className='mt-2 text-lg font-bold sm:col-span-2'>Dados profissionais</h2>
      {(['titulo','especialidade','registroProfissional','formacaoAcademica','fotoPerfilUrl'] as const).map((field) => <label key={field} className='grid gap-2 text-sm font-medium text-gray-700'>{({titulo:'Título',especialidade:'Especialidade',registroProfissional:'Registro profissional',formacaoAcademica:'Formação acadêmica',fotoPerfilUrl:'URL da foto'})[field]}<input value={form[field] || ''} onChange={(event) => update(field,event.target.value)} className='rounded-lg border border-gray-300 px-3 py-2' /></label>)}
      <label className='grid gap-2 text-sm font-medium text-gray-700 sm:col-span-2'>Sobre<textarea value={form.sobre || ''} onChange={(event) => update('sobre',event.target.value)} rows={5} className='rounded-lg border border-gray-300 px-3 py-2' /></label>
      <div className='flex gap-3 sm:col-span-2'><button type='button' onClick={() => navigate('/profissional/perfil')} className='rounded-lg border px-4 py-2'>Cancelar</button><button type='submit' disabled={saving} className='rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50'>{saving ? 'Salvando...' : 'Salvar'}</button></div>
    </form>}
  </PageLayout>
}
