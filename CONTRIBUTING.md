# Guia de Contribuição - Capelo's Club

Obrigado por considerar contribuir com o Capelo's Club! 📚

## Como Contribuir

### Reportando Bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/Dev-MJBS/Capelo-Club/issues)
2. Se não encontrar, crie uma nova issue com:
   - Título descritivo
   - Passos para reproduzir o bug
   - Comportamento esperado vs. comportamento atual
   - Screenshots (se aplicável)
   - Ambiente (navegador, sistema operacional)

### Sugerindo Melhorias

1. Abra uma issue com a tag `enhancement`
2. Descreva claramente a melhoria proposta
3. Explique por que seria útil para a comunidade

### Contribuindo com Código

#### Configuração do Ambiente de Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/Dev-MJBS/Capelo-Club.git
cd Capelo-Club

# Instale as dependências
npm install --legacy-peer-deps

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute o projeto localmente
npm run dev

# Execute os testes
npm test

# Execute o linter
npm run lint
```

#### Processo de Pull Request

1. **Fork** o repositório
2. **Crie uma branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Faça commits** com mensagens descritivas seguindo [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` para novas features
   - `fix:` para correções de bugs
   - `docs:` para mudanças na documentação
   - `test:` para adicionar ou modificar testes
   - `refactor:` para refatorações de código
   - `style:` para mudanças de formatação
4. **Escreva testes** para suas mudanças (cobertura mínima: 70%)
5. **Execute os testes** e garanta que todos passem
6. **Execute o linter** e corrija quaisquer problemas
7. **Push** para sua branch (`git push origin feature/MinhaFeature`)
8. **Abra um Pull Request** com:
   - Título descritivo
   - Descrição detalhada das mudanças
   - Referência a issues relacionadas (se aplicável)
   - Screenshots (se mudanças visuais)

#### Padrões de Código

- **TypeScript**: Todo código deve ser tipado
- **Componentes**: Use componentes funcionais com hooks
- **Estilo**: Siga o padrão do projeto (Tailwind CSS)
- **Acessibilidade**: Adicione ARIA labels e garanta navegação por teclado
- **Performance**: Otimize imagens, use lazy loading
- **Mobile-first**: Garanta responsividade

#### Estrutura de Arquivos

```
src/
├── app/              # Next.js App Router pages
├── components/       # Componentes React reutilizáveis
├── hooks/            # Custom hooks
├── lib/              # Utilitários e configurações
└── middleware.ts     # Next.js middleware

supabase/
├── migrations/       # Migrações do banco de dados
└── schema.sql        # Schema principal

__tests__/            # Testes
├── components/       # Testes de componentes
├── integration/      # Testes de integração
└── lib/              # Testes de utilitários
```

### Escrevendo Testes

```typescript
// Exemplo de teste de componente
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Migrações de Banco de Dados

Se sua contribuição requer mudanças no banco de dados:

1. Crie um novo arquivo em `supabase/migrations/` com formato: `YYYYMMDD_description.sql`
2. Documente as mudanças no PR
3. Teste a migração localmente antes de submeter

## Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em seguir seus termos.

## Dúvidas?

Sinta-se à vontade para abrir uma issue com a tag `question` ou entrar em contato através do botão "Contatar Moderação" no site.

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT License).
