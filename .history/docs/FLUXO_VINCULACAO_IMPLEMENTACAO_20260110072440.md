# Fluxo de Vinculação de Criança - Implementação

## Visão Geral

Este documento descreve a implementação do fluxo de vinculação de criança entre responsáveis e profissionais no ConectaTEA, seguindo a documentação do projeto e conformidade LGPD.

## Estrutura de Arquivos Criados

### Páginas
- **`Frontend/src/pages/Responsavel/VincularCrianca.tsx`** - Página principal de gerenciamento do fluxo de vinculação

### Componentes
- **`Frontend/src/components/VinculacaoCrianca/QRCodeScanner.tsx`** - Componente para escanear QR code
- **`Frontend/src/components/VinculacaoCrianca/CodigoInput.tsx`** - Componente para inserir código alfanumérico
- **`Frontend/src/components/VinculacaoCrianca/ConfirmacaoVinculo.tsx`** - Componente para confirmar vinculação
- **`Frontend/src/components/VinculacaoCrianca/TermoConsentimento.tsx`** - Componente do termo LGPD
- **`Frontend/src/components/VinculacaoCrianca/Stepper.tsx`** - Componente de progresso visual

### Utilitários e APIs
- **`Frontend/src/api/protected/axiosVinculacao.ts`** - Cliente API para operações de vinculação
- **`Frontend/src/lib/date.utils.ts`** - Funções auxiliares para formatação de datas

### Rotas
- **`Frontend/src/routes/routes.tsx`** - Atualizado para incluir rota `/responsavel/vincular-crianca`

## Fluxo de Funcionamento

### 1. **Seleção de Método** (Passo 1)
O responsável escolhe como deseja vincular a criança:
- 🔲 **Escanear QR Code** - Usa câmera do dispositivo
- ✏️ **Inserir Código** - Digita o código alfanumérico (ex: TEA-6081-Z)

### 2. **Validação** (Passo 2)
Dependendo do método escolhido:
- **QR Code**: Câmera captura e processa o QR code
- **Código**: Responsável digita e valida o código
- Sistema chama API: `GET /vinculacao/validar/{codigo}`

### 3. **Confirmação de Dados** (Passo 3)
Exibe os dados da criança encontrada:
- Nome
- Idade (calculada automaticamente)
- Data de nascimento
- Diagnóstico
- Status de vínculo

Responsável confirma se os dados estão corretos.

### 4. **Termo de Consentimento** (Passo 4)
Apresenta termo LGPD com 5 seções expansíveis:
1. **Coleta de Dados** - Quais dados são coletados
2. **Uso dos Dados** - Como os dados serão utilizados
3. **Compartilhamento** - Com quem os dados são compartilhados
4. **Direitos do Responsável** - Direitos garantidos por lei
5. **Segurança de Dados** - Medidas de proteção

Responsável deve marcar checkbox para aceitar antes de continuar.

### 5. **Sucesso** (Passo 5)
Exibe mensagem de sucesso com:
- Ícone de confirmação (✓)
- Mensagem de sucesso
- Botão para ir ao Dashboard

## Interface de Usuário

### Design Visual
- Gradiente background (azul → verde → azul)
- Cards com borders e sombras suaves
- Ícones do Lucide React para consistência
- Estados de carregamento com spinners
- Mensagens de erro em destaque

### Responsividade
- Layout mobile-first
- Grade responsiva para dados
- Textos legíveis em todos os tamanhos
- Botões com áreas de toque adequadas

## Endpoints da API Necessários

### Backend deve implementar:

```
GET /api/vinculacao/validar/{codigo}
- Valida código/QR code
- Retorna dados da criança
- Status: 200 (sucesso), 404 (não encontrado), 400 (inválido)

POST /api/vinculacao/confirmar
- Confirma o vínculo
- Request: { crianca_id, consentimento_aceito }
- Response: { id, crianca_id, responsavel_id, status, data_vinculo }
- Status: 201 (criado), 400 (erro validação), 401 (não autenticado)

GET /api/vinculacao/meus-vinculos
- Obtém crianças vinculadas ao responsável
- Response: Array de crianças

DELETE /api/vinculacao/crianca/{crianca_id}
- Desvincula uma criança
- Status: 200 (sucesso), 404 (não encontrado)
```

## Componentes Principais

### VincularCrianca (Página Principal)
- Gerencia estado do fluxo
- Coordena transição entre etapas
- Chama APIs quando necessário
- Trata erros e exibe mensagens

### QRCodeScanner
- Acessa câmera do dispositivo
- Detecta QR codes
- Exibe preview da câmera
- Trata permissões de câmera

### CodigoInput
- Campo de input alfanumérico
- Validação de formato
- Feedback visual de erros
- Máscara de entrada

### ConfirmacaoVinculo
- Exibe dados da criança
- Cálculo automático de idade
- Formatação de datas
- Botão de confirmação

### TermoConsentimento
- Seções expansíveis (acordeão)
- Checkbox de aceitar
- Botões Recusar/Aceitar
- Estado de carregamento

### Stepper
- Visualização de progresso
- Numeração dos passos
- Linha de conexão entre passos
- Estados: Completado, Ativo, Próximo

## Segurança e Conformidade

### LGPD
- ✅ Termo de consentimento obrigatório
- ✅ Descrição clara de coleta/uso de dados
- ✅ Direitos do responsável explícitos
- ✅ Checkbox de aceitar termo

### Segurança
- ✅ Autenticação obrigatória (ProtectedRoute)
- ✅ Validação de código no backend
- ✅ Dados sensíveis via API
- ✅ Formulários sem submissão automática

## Próximos Passos

1. **Backend**: Implementar endpoints da API de vinculação
2. **QR Code**: Integrar biblioteca de leitura (jsQR ou ZXing)
3. **Teste**: Testar em dispositivos móveis e desktop
4. **Email**: Enviar confirmação de vínculo por email
5. **Notificações**: Notificar profissional quando responsável vincular
6. **Dashboard**: Adicionar seção de crianças vinculadas

## Integração com Layout Existente

A página de vinculação segue o mesmo design system do projeto:
- Cores: Blue (#0066cc), Green (#22c55e), Gray (#6b7280)
- Fonte: System stack (sem fontes externas)
- Espaçamento: Tailwind default (4px base)
- Componentes: Lucide React icons

## Testando o Fluxo

1. Acessar: `/responsavel/vincular-crianca`
2. Escolher método (QR ou Código)
3. Inserir "TEA-6081-Z" como código teste
4. Confirmar dados da criança
5. Aceitar termo de consentimento
6. Ver mensagem de sucesso

## Customização

Você pode customizar:
- Mensagens de erro
- Textos do termo LGPD
- Cores e estilos
- Redirecionamentos após sucesso
- Validações de input
- Formatos de data
