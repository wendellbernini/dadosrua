#!/bin/bash

# Script de deploy para o webapp de coleta de dados
echo "🚀 Iniciando deploy do webapp de coleta de dados..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Erro: Variáveis de ambiente do Supabase não configuradas"
    echo "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar build
echo "🔨 Executando build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "🌐 O projeto está pronto para deploy na Vercel"
    echo ""
    echo "Para fazer o deploy:"
    echo "1. Conecte o repositório à Vercel"
    echo "2. Configure as variáveis de ambiente:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "3. Execute o schema SQL no Supabase"
    echo "4. Deploy automático será executado"
else
    echo "❌ Erro no build. Verifique os logs acima."
    exit 1
fi
