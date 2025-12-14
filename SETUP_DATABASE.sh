#!/bin/bash

echo "🔧 Setup do Banco de Dados - Capelo Club"
echo "========================================"
echo ""
echo "Para criar as tabelas necessárias, siga estes passos:"
echo ""
echo "1. Acesse: https://supabase.com/dashboard"
echo "2. Selecione seu projeto"
echo "3. Vá para: SQL Editor"
echo "4. Cole todo o código abaixo e clique em 'Execute'"
echo ""
echo "════════════════════════════════════════════════════════════════"
cat supabase/schema.sql
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Após executar o SQL acima, as tabelas serão criadas!"
echo ""
echo "Opcionalmente, você pode executar também o seed para adicionar dados de exemplo:"
cat supabase/seed_groups.sql
