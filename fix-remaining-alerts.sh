#!/bin/bash

# Script para substituir alerts por toasts nos componentes restantes
# Executar com: bash fix-remaining-alerts.sh

echo "🔧 Corrigindo alerts restantes..."

# Lista de arquivos para corrigir
files=(
  "src/components/BookOfTheMonthCard.tsx"
  "src/components/EditGroupButton.tsx"
  "src/components/SubclubPostForm.tsx"
  "src/components/ReportButton.tsx"
  "src/components/TweetInput.tsx"
  "src/components/FollowButton.tsx"
  "src/components/VerifyUserButton.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Processando $file..."
    
    # Adicionar import do toast se não existir
    if ! grep -q "import toast from 'react-hot-toast'" "$file"; then
      # Encontrar a última linha de import e adicionar após ela
      sed -i '' "/^import.*from/a\\
import toast from 'react-hot-toast'
" "$file"
    fi
    
    # Substituir alerts por toasts
    sed -i '' "s/alert('/toast.error('/g" "$file"
    sed -i '' 's/alert("/toast.error("/g' "$file"
    sed -i '' 's/alert(`/toast.error(`/g' "$file"
    
  else
    echo "⚠️  Arquivo não encontrado: $file"
  fi
done

echo "✅ Concluído!"
