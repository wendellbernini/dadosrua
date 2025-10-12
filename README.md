# DadosRua - Webapp de Coleta de Dados

Webapp para coleta de dados de rua desenvolvido para equipes de campanha política.

## 🚀 Tecnologias

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase (Auth + Database)
- **Deploy**: Vercel
- **Mobile-first**: Design otimizado para dispositivos móveis

## 📋 Funcionalidades

### Para Coletadores
- ✅ Login/Registro de usuários
- ✅ Visualizar campanhas ativas
- ✅ Entrar em campanhas
- ✅ Coletar contatos (bairro, nome, telefone, demanda)
- ✅ Editar contatos até o fim da campanha
- ✅ Interface mobile otimizada

### Para Administradores
- ✅ Dashboard com estatísticas
- ✅ Gerenciar campanhas
- ✅ Gerenciar usuários
- ✅ Exportar dados para Excel
- ✅ Configurações do sistema

## 🛠️ Configuração

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL do arquivo `supabase-schema.sql` no SQL Editor
3. Copie as credenciais do projeto

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

### 5. Deploy na Vercel

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente
3. Faça o deploy

## 📱 Uso

### Primeiro Acesso
1. Acesse a aplicação
2. Clique em "Criar Conta" (se registro estiver aberto)
3. Faça login com suas credenciais

### Para Coletadores
1. Visualize campanhas ativas
2. Entre em uma campanha
3. Colete contatos usando o formulário
4. Edite contatos se necessário

### Para Administradores
1. Acesse o dashboard admin
2. Crie campanhas
3. Monitore estatísticas
4. Exporte dados

## 🗂️ Estrutura do Projeto

```
src/
├── app/                 # Páginas Next.js
│   ├── admin/          # Páginas administrativas
│   ├── collector/      # Páginas do coletador
│   ├── login/          # Página de login
│   └── register/       # Página de registro
├── components/         # Componentes React
│   ├── admin/         # Componentes administrativos
│   ├── collector/     # Componentes do coletador
│   ├── auth/          # Componentes de autenticação
│   └── ui/            # Componentes de UI
├── hooks/             # Hooks customizados
├── lib/               # Utilitários e configurações
└── data/              # Dados estáticos
```

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco
- Validação de formulários com Zod
- Proteção de rotas por role

## 📊 Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `campaigns` - Campanhas de coleta
- `campaign_participants` - Participantes das campanhas
- `contacts` - Contatos coletados
- `app_settings` - Configurações do sistema

## 🎯 Próximos Passos

- [ ] Notificações push
- [ ] Relatórios avançados
- [ ] Integração com WhatsApp
- [ ] Backup automático

## 📞 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

Desenvolvido com ❤️ para campanhas políticas eficientes.