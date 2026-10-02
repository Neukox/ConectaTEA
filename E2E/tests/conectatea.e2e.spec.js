import { test, expect } from '@playwright/test'

const API = process.env.E2E_API_URL || 'http://127.0.0.1:3000/api'
const PASSWORD = 'ConectaTEA-E2E-2026!'

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function register(page, name, email, role) {
  await page.goto('/register')
  await page.locator('input[name="nome"]').fill(name)
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="senha"]').fill(PASSWORD)
  await page.locator('input[name="confirmarSenha"]').fill(PASSWORD)
  await page.locator('select[name="tipoUsuario"]').selectOption(role.toLowerCase())
  await page.getByRole('button', { name: 'Criar Conta' }).click()
  await expect(page).toHaveURL(/\/login$/, { timeout: 15000 })
}

async function login(page, email, role) {
  await page.goto('/login')
  await page.getByPlaceholder('seu@email.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(PASSWORD)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(
    role === 'PROFISSIONAL'
      ? /\/profissional\/dashboard$/
      : /\/responsavel\/dashboard$/,
    { timeout: 15000 },
  )
}

async function api(page, path, method = 'GET', body) {
  return page.evaluate(async ({ API, path, method, body }) => {
    const headers = { 'Content-Type': 'application/json' }
    const csrf = document.cookie
      .split('; ')
      .find((item) => item.startsWith('XSRF-TOKEN='))
    if (method !== 'GET' && csrf) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrf.split('=').slice(1).join('='))
    }
    const response = await fetch(`${API}${path}`, {
      method,
      credentials: 'include',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()
    let json = null
    try { json = text ? JSON.parse(text) : null } catch {}
    return { status: response.status, json }
  }, { API, path, method, body })
}

function ymd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

test('fluxo principal React + Java + PostgreSQL', async ({ browser }) => {
  const run = id()
  const profissional = {
    nome: `Profissional E2E ${run}`,
    email: `prof-${run}@example.test`,
  }
  const responsavel = {
    nome: `Responsavel E2E ${run}`,
    email: `resp-${run}@example.test`,
  }
  const intruso = {
    nome: `Responsavel IDOR ${run}`,
    email: `idor-${run}@example.test`,
  }
  const outroProfissional = {
    nome: `Profissional B ${run}`,
    email: `prof2-${run}@example.test`,
  }

  const nomeCrianca = `Crianca E2E ${run}`
  const tituloMeta = `Meta E2E ${run}`
  const descricaoSessao = `Sessao E2E ${run}`

  const profContext = await browser.newContext()
  const profPage = await profContext.newPage()

  await register(profPage, profissional.nome, profissional.email, 'PROFISSIONAL')
  await login(profPage, profissional.email, 'PROFISSIONAL')
  await expect(profPage.getByText('Crianças Recentes')).toBeVisible()
  await expect(profPage.getByText('Metas em Andamento')).toBeVisible()

  const me = await api(profPage, '/auth/me')
  expect(me.status).toBe(200)
  expect(me.json.user.tipo).toBe('PROFISSIONAL')

  await profPage.goto('/profissional/perfil/editar')
  await profPage.getByRole('button', { name: 'Adicionar local' }).click()
  await profPage.getByPlaceholder('Nome do local').fill(`Clinica E2E ${run}`)
  await profPage.getByPlaceholder('Cidade').fill('Salvador')
  const localCreated = profPage.waitForResponse((r) => r.url().endsWith('/api/profissionais/me/locais-atendimento') && r.request().method() === 'POST')
  await profPage.getByRole('button', { name: 'Salvar local' }).click()
  expect((await localCreated).status()).toBe(201)

  await profPage.getByRole('button', { name: 'Adicionar rede' }).click()
  await profPage.getByPlaceholder('Plataforma').fill('LinkedIn')
  await profPage.getByPlaceholder('https://...').fill(`https://example.test/${run}`)
  const networkCreated = profPage.waitForResponse((r) => r.url().endsWith('/api/profissionais/me/redes-sociais') && r.request().method() === 'POST')
  await profPage.getByRole('button', { name: 'Salvar rede' }).click()
  expect((await networkCreated).status()).toBe(201)

  await profPage.goto('/profissional/perfil')
  await expect(profPage.getByText(`Clinica E2E ${run}`)).toBeVisible()
  await expect(profPage.getByRole('link', { name: 'LinkedIn' })).toBeVisible()

  await profPage.goto('/profissional/criancas')
  await profPage.getByRole('button', { name: 'Nova Criança' }).click()
  const childDialog = profPage.getByRole('dialog')
  await childDialog.getByPlaceholder('Digite o nome completo da criança').fill(nomeCrianca)
  await childDialog.getByPlaceholder('Idade em anos').fill('8')
  await childDialog.locator('input[type="date"]').fill('2018-01-15')
  await childDialog.locator('select').nth(0).selectOption('Masculino')
  await childDialog.locator('select').nth(1).selectOption('TEA - Transtorno do Espectro Autista')
  await childDialog.getByPlaceholder('Nome completo do responsável').fill(responsavel.nome)
  await childDialog.getByPlaceholder('(11) 99999-9999').fill('71999999999')
  await childDialog.locator('select').nth(2).selectOption('PAI')
  await childDialog.getByPlaceholder('email@exemplo.com').fill(responsavel.email)

  const childCreated = profPage.waitForResponse(
    (r) => r.url().endsWith('/api/criancas') && r.request().method() === 'POST'
  )
  await childDialog.getByRole('button', { name: 'Cadastrar Criança' }).click()
  const childResponse = await childCreated
  expect(childResponse.status()).toBe(201)
  const childBody = await childResponse.json()
  const childId = childBody.crianca.id
  await expect(profPage.getByText(nomeCrianca, { exact: true })).toBeVisible()

  await profPage.goto('/profissional/metas')
  await profPage.getByRole('button', { name: 'Nova Meta' }).click()
  const metaDialog = profPage.getByRole('dialog')
  await metaDialog.getByPlaceholder('Ex: Melhorar comunicação verbal').fill(tituloMeta)
  await metaDialog.locator('select').nth(2).selectOption({ label: nomeCrianca })

  const inicio = new Date()
  const fim = new Date()
  fim.setDate(fim.getDate() + 30)
  await metaDialog.locator('input[type="date"]').nth(0).fill(ymd(inicio))
  await metaDialog.locator('input[type="date"]').nth(1).fill(ymd(fim))
  await metaDialog.getByPlaceholder('Descreva os objetivos específicos e estratégias...').fill('Meta criada pelo E2E.')

  const metaCreated = profPage.waitForResponse(
    (r) => r.url().endsWith('/api/metas') && r.request().method() === 'POST'
  )
  await metaDialog.getByRole('button', { name: 'Salvar Meta' }).click()
  const metaResponse = await metaCreated
  expect(metaResponse.status()).toBe(201)
  const metaBody = await metaResponse.json()
  expect(metaBody.criancaId).toBe(childId)

  const progress = await api(profPage, `/metas/${metaBody.id}/progresso`, 'PATCH', {
    progresso: 50,
    descricao: 'Atualizacao E2E',
  })
  expect(progress.status).toBe(200)
  expect(progress.json.progresso).toBe(50)

  const future = new Date(Date.now() + 86400000)
  const offset = -future.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const zone = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`

  const session = await api(profPage, '/sessoes', 'POST', {
    criancaId: childId,
    tipo: 'TERAPIA_INDIVIDUAL',
    dataHora: `${ymd(future)}T10:00:00${zone}`,
    duracao: 60,
    descricao: descricaoSessao,
    observacoes: 'Criada no E2E',
  })
  expect(session.status).toBe(201)

  await profPage.goto('/profissional/sessoes')
  await expect(profPage.getByText(descricaoSessao, { exact: true })).toBeVisible()

  await profPage.goto('/profissional/criancas')
  const card = profPage.locator('div').filter({ hasText: nomeCrianca }).filter({
    has: profPage.getByRole('button', { name: 'Gerar código' })
  }).first()

  const tokenCreated = profPage.waitForResponse(
    (r) => r.url().includes(`/api/criancas/${childId}/tokens-vinculo`) && r.request().method() === 'POST'
  )
  await card.getByRole('button', { name: 'Gerar código' }).click()
  const tokenResponse = await tokenCreated
  expect(tokenResponse.status()).toBe(200)
  const token = await tokenResponse.json()
  expect(token.codigo).toBeTruthy()
  await expect(profPage.getByAltText('QR Code de vínculo')).toBeVisible()

  const logout = await api(profPage, '/auth/logout', 'POST')
  expect(logout.status).toBe(200)

  const respContext = await browser.newContext()
  const respPage = await respContext.newPage()
  await register(respPage, responsavel.nome, responsavel.email, 'RESPONSAVEL')
  await login(respPage, responsavel.email, 'RESPONSAVEL')
  await expect(respPage.getByText('Próximas sessões')).toBeVisible()

  await respPage.goto('/responsavel/vincular-crianca')
  await respPage.getByRole('button', { name: 'Inserir Código' }).click()
  await respPage.locator('#codigo').fill(token.codigo)
  await respPage.getByRole('button', { name: 'Continuar' }).click()
  await expect(respPage.getByText(nomeCrianca, { exact: true })).toBeVisible()
  await respPage.getByRole('button', { name: 'Prosseguir com Consentimento' }).click()
  await respPage.locator('input[type="checkbox"]').check()

  const confirm = respPage.waitForResponse(
    (r) => r.url().endsWith('/api/vinculos/confirmar') && r.request().method() === 'POST'
  )
  await respPage.getByRole('button', { name: 'Aceitar e Confirmar' }).click()
  expect((await confirm).status()).toBe(200)
  await expect(respPage.getByText('Vínculo Criado com Sucesso!')).toBeVisible()

  const dashboardResp = await api(respPage, '/dashboard/responsavel')
  expect(dashboardResp.status).toBe(200)
  expect(dashboardResp.json.totalCriancas).toBe(1)
  expect(dashboardResp.json.totalMetas).toBeGreaterThanOrEqual(1)

  const replay = await api(respPage, `/vinculos/tokens/${encodeURIComponent(token.codigo)}/preview`)
  expect(replay.status).toBe(410)

  const intrusoContext = await browser.newContext()
  const intrusoPage = await intrusoContext.newPage()
  await register(intrusoPage, intruso.nome, intruso.email, 'RESPONSAVEL')
  await login(intrusoPage, intruso.email, 'RESPONSAVEL')
  const denied = await api(intrusoPage, `/criancas/${childId}`)
  expect(denied.status).toBe(403)
  await intrusoContext.close()

  const prof2Context = await browser.newContext()
  const prof2Page = await prof2Context.newPage()
  await register(prof2Page, outroProfissional.nome, outroProfissional.email, 'PROFISSIONAL')
  await login(prof2Page, outroProfissional.email, 'PROFISSIONAL')
  const prof2 = await api(prof2Page, '/profissionais/me')
  expect(prof2.status).toBe(200)

  await login(profPage, profissional.email, 'PROFISSIONAL')
  await profPage.goto('/profissional/profissionais')
  await profPage.getByPlaceholder('Buscar por nome, especialidade ou título').fill(outroProfissional.nome)
  const prof2Card = profPage.locator('article').filter({ hasText: outroProfissional.nome }).first()
  await expect(prof2Card).toBeVisible()

  const connectionCreated = profPage.waitForResponse(
    (r) => r.url().endsWith('/api/conexoes') && r.request().method() === 'POST'
  )
  await prof2Card.getByRole('button', { name: 'Conectar' }).click()
  const connectionResponse = await connectionCreated
  expect(connectionResponse.status()).toBe(201)
  const connection = await connectionResponse.json()
  expect(connection.destinatarioId).toBe(prof2.json.id)

  const accepted = await api(prof2Page, `/conexoes/${connection.id}/responder`, 'PUT', { status: 'ACEITO' })
  expect(accepted.status).toBe(200)
  expect(accepted.json.status).toBe('ACEITO')

  const dashboardProf = await api(profPage, '/dashboard/profissional')
  expect(dashboardProf.status).toBe(200)
  expect(dashboardProf.json.totalCriancas).toBeGreaterThanOrEqual(1)
  expect(dashboardProf.json.profissionaisAtivos).toBeGreaterThanOrEqual(1)

  await respPage.goto('/responsavel/criancas')
  await expect(respPage.getByText(nomeCrianca, { exact: true })).toBeVisible()
  const unlink = respPage.waitForResponse(
    (r) => r.url().endsWith(`/api/vinculos/criancas/${childId}`) && r.request().method() === 'DELETE'
  )
  await respPage.getByRole('button', { name: 'Desvincular' }).click()
  expect((await unlink).status()).toBe(204)
  await expect(respPage.getByText('Nenhuma criança vinculada ainda.')).toBeVisible()

  const afterUnlink = await api(respPage, `/criancas/${childId}`)
  expect(afterUnlink.status).toBe(403)

  await prof2Context.close()
  await respContext.close()
  await profContext.close()
})
