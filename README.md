# Webapp de Coleta de Dados - Equipe de Rua

Sistema de coleta de dados para a equipe de rua do vereador Fernando Armelau, desenvolvido com Next.js 14, Supabase e TailwindCSS.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Supabase (Auth + Database + Storage)
- **Deploy**: Vercel
- **Mobile-first**: Design responsivo otimizado para dispositivos móveis

## 📋 Funcionalidades

### Para Coletores
- ✅ Login/Registro de usuários
- ✅ Visualizar campanhas ativas
- ✅ Entrar em campanhas
- ✅ Coletar dados de contatos (bairro, nome, telefone, demanda)
- ✅ Editar contatos durante campanha ativa
- ✅ Autocomplete de bairros do Rio de Janeiro
- ✅ Interface mobile-first

### Para Administradores
- ✅ Dashboard com estatísticas
- ✅ Gerenciar campanhas (criar, editar, finalizar)
- ✅ Gerenciar usuários
- ✅ Visualizar todos os dados coletados
- ✅ Exportar dados para Excel
- ✅ Configurar registro de usuários
- ✅ Definir horários de campanha

## 🛠️ Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd dadosrua
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o arquivo `supabase-schema.sql` no SQL Editor do Supabase
3. Copie as credenciais do projeto

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
```

### 5. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📱 Como Usar

### Primeiro Acesso (Admin)
1. Acesse `/register` para criar a primeira conta
2. No banco de dados, altere o role do usuário para 'admin':
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
   ```

### Criando Campanhas
1. Faça login como admin
2. Acesse o dashboard
3. Clique em "Nova Campanha"
4. Preencha os dados (nome, local, data/hora início e fim)
5. A campanha ficará disponível para os coletores

### Coletando Dados
1. Faça login como coletador
2. Veja as campanhas ativas
3. Clique em "Entrar em Campanha"
4. Use o formulário para coletar dados
5. Os dados ficam salvos automaticamente

## 🗂️ Estrutura do Projeto

```
src/
├── app/                    # Páginas do Next.js (App Router)
│   ├── admin/             # Páginas do admin
│   ├── collector/         # Páginas do coletador
│   ├── login/             # Página de login
│   └── register/          # Página de registro
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (shadcn/ui)
│   └── ...               # Outros componentes
├── lib/                  # Utilitários e configurações
│   ├── supabase.ts       # Cliente Supabase
│   ├── validations.ts    # Schemas de validação (Zod)
│   └── utils.ts          # Funções utilitárias
└── data/                 # Dados estáticos
    └── neighborhoods.json # Lista de bairros do RJ
```

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado no Supabase
- Coletores só veem seus próprios dados
- Admins têm acesso total
- Validação de formulários com Zod
- Sanitização de inputs

## 📊 Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `campaigns` - Campanhas de coleta
- `campaign_participants` - Participantes das campanhas
- `contacts` - Contatos coletados
- `app_settings` - Configurações do app

### Relacionamentos
- Um usuário pode participar de várias campanhas
- Uma campanha pode ter vários participantes
- Um contato pertence a uma campanha e um coletador

## 🚀 Deploy

### Vercel
1. Conecte o repositório à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Variáveis de Ambiente (Produção)
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
```

## 📝 Licença

Este projeto é privado e destinado ao uso da equipe de rua do vereador Fernando Armelau.

## 🤝 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.