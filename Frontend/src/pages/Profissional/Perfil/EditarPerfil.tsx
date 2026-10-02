import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { atualizarMeuPerfilProfissional, obterMeuPerfilProfissional, type AtualizarProfissionalRequest } from '~/api/protected/axiosProfissionais'
import { getApiErrorMessage } from '~/api/errors'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import { PageLayout } from '~/components/layout'
import Header from '~/components/layout/Header'
import { atualizarMeuUsuario, obterMeuUsuario, type AtualizarUsuarioRequest } from '~/api/protected/axiosUsuarios'
import { useAuth } from '~/hooks/useAuth'
import { atualizarLocal, atualizarRede, criarLocal, criarRede, desvincularArea, excluirLocal, excluirRede, listarAreas, listarMeusLocais, listarMinhasAreas, listarMinhasRedes, vincularArea, type AreaAtuacao, type LocalAtendimento, type RedeSocial } from '~/api/protected/axiosRecursosProfissionais'

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
  const [locais, setLocais] = useState<LocalAtendimento[]>([])
  const [redes, setRedes] = useState<RedeSocial[]>([])
  const [areas, setAreas] = useState<AreaAtuacao[]>([])
  const [minhasAreas, setMinhasAreas] = useState<AreaAtuacao[]>([])

  useEffect(() => {
    void Promise.all([obterMeuPerfilProfissional(), obterMeuUsuario(), listarMeusLocais(), listarMinhasRedes(), listarAreas(), listarMinhasAreas()]).then(([perfil, user, loadedLocais, loadedRedes, loadedAreas, loadedMinhasAreas]) => {
      setUsuario({ name: user.name, telefone: user.telefone, endereco: user.endereco })
      setForm({
      especialidade: perfil.especialidade, registroProfissional: perfil.registroProfissional,
      titulo: perfil.titulo, formacaoAcademica: perfil.formacaoAcademica,
      sobre: perfil.sobre, fotoPerfilUrl: perfil.fotoPerfilUrl,
      })
      setLocais(loadedLocais); setRedes(loadedRedes); setAreas(loadedAreas); setMinhasAreas(loadedMinhasAreas)
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

  const persistLocal = async (local: LocalAtendimento) => {
    try { const saved = local.id < 0 ? await criarLocal(local) : await atualizarLocal(local.id, local); setLocais((items) => items.map((item) => item.id === local.id ? saved : item)); notificarSucesso('Local salvo', 'Local de atendimento atualizado.') } catch (error) { notificarErro('Erro ao salvar local', getApiErrorMessage(error)) }
  }
  const persistRede = async (rede: RedeSocial) => {
    try { const saved = rede.id < 0 ? await criarRede(rede) : await atualizarRede(rede.id, rede); setRedes((items) => items.map((item) => item.id === rede.id ? saved : item)); notificarSucesso('Rede salva', 'Rede social atualizada.') } catch (error) { notificarErro('Erro ao salvar rede', getApiErrorMessage(error)) }
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
      <section className='grid gap-3 sm:col-span-2'><div className='flex items-center justify-between'><h2 className='text-lg font-bold'>Locais de atendimento</h2><button type='button' onClick={() => setLocais((items) => [...items, { id: -Date.now(), nome: '', cidade: '' }])} className='rounded-lg border px-3 py-1'>Adicionar local</button></div>
        {locais.map((local) => <div key={local.id} className='grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]'><input aria-label='Nome do local' placeholder='Nome do local' value={local.nome} onChange={(event) => setLocais((items) => items.map((item) => item.id === local.id ? {...item, nome:event.target.value} : item))} className='rounded-lg border px-3 py-2'/><input aria-label='Cidade do local' placeholder='Cidade' value={local.cidade} onChange={(event) => setLocais((items) => items.map((item) => item.id === local.id ? {...item, cidade:event.target.value} : item))} className='rounded-lg border px-3 py-2'/><button type='button' onClick={() => void persistLocal(local)} className='rounded-lg bg-green-600 px-3 text-white'>Salvar local</button><button type='button' onClick={() => void (local.id < 0 ? Promise.resolve(setLocais((items) => items.filter((item) => item.id !== local.id))) : excluirLocal(local.id).then(() => setLocais((items) => items.filter((item) => item.id !== local.id))).catch((error) => notificarErro('Erro ao excluir local', getApiErrorMessage(error))))} className='rounded-lg border px-3'>Excluir</button></div>)}
      </section>
      <section className='grid gap-3 sm:col-span-2'><div className='flex items-center justify-between'><h2 className='text-lg font-bold'>Redes sociais</h2><button type='button' onClick={() => setRedes((items) => [...items, { id: -Date.now(), tipo: '', url: '' }])} className='rounded-lg border px-3 py-1'>Adicionar rede</button></div>
        {redes.map((rede) => <div key={rede.id} className='grid gap-2 sm:grid-cols-[1fr_2fr_auto_auto]'><input aria-label='Tipo da rede' placeholder='Plataforma' value={rede.tipo} onChange={(event) => setRedes((items) => items.map((item) => item.id === rede.id ? {...item, tipo:event.target.value} : item))} className='rounded-lg border px-3 py-2'/><input aria-label='URL da rede' placeholder='https://...' value={rede.url} onChange={(event) => setRedes((items) => items.map((item) => item.id === rede.id ? {...item, url:event.target.value} : item))} className='rounded-lg border px-3 py-2'/><button type='button' onClick={() => void persistRede(rede)} className='rounded-lg bg-green-600 px-3 text-white'>Salvar rede</button><button type='button' onClick={() => void (rede.id < 0 ? Promise.resolve(setRedes((items) => items.filter((item) => item.id !== rede.id))) : excluirRede(rede.id).then(() => setRedes((items) => items.filter((item) => item.id !== rede.id))).catch((error) => notificarErro('Erro ao excluir rede', getApiErrorMessage(error))))} className='rounded-lg border px-3'>Excluir</button></div>)}
      </section>
      <section className='grid gap-3 sm:col-span-2'><h2 className='text-lg font-bold'>Áreas de atuação</h2>{areas.length === 0 ? <p className='text-sm text-gray-600'>O catálogo ainda não possui áreas cadastradas.</p> : areas.map((area) => { const checked = minhasAreas.some((item) => item.id === area.id); return <label key={area.id} className='flex gap-2'><input type='checkbox' checked={checked} onChange={() => void (checked ? desvincularArea(area.id).then(() => setMinhasAreas((items) => items.filter((item) => item.id !== area.id))) : vincularArea(area.id).then((linked) => setMinhasAreas((items) => [...items, linked]))).catch((error) => notificarErro('Erro ao atualizar área', getApiErrorMessage(error)))} />{area.nome}</label> })}</section>
      <div className='flex gap-3 sm:col-span-2'><button type='button' onClick={() => navigate('/profissional/perfil')} className='rounded-lg border px-4 py-2'>Cancelar</button><button type='submit' disabled={saving} className='rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50'>{saving ? 'Salvando...' : 'Salvar'}</button></div>
    </form>}
  </PageLayout>
}
