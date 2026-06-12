## 1. Banco de Dados e Migração

- [ ] 1.1 Criar script de migração SQL com a tabela `custom_categories` (id uuid PK, name text NOT NULL, keywords text[] NOT NULL, active boolean DEFAULT true, created_at timestamptz DEFAULT now()).
- [ ] 1.2 Adicionar seed idempotente das 4 categorias legadas (Ração, Pesca, Sementes, Adubo) com suas keywords atuais, usando `ON CONFLICT` ou `WHERE NOT EXISTS`.
- [ ] 1.3 Adicionar políticas de RLS na tabela (leitura pública para usuários autenticados, escrita apenas para admin).
- [ ] 1.4 Criar interface `DBCustomCategory` no schema (`agropet-admin/src/db/schema.ts` e equivalente no cliente).

## 2. Hook Compartilhado de Categorias

- [ ] 2.1 Escrever teste para hook `useCategories` que valida: fetch de categorias ativas, fetch de todas (incluindo inativas), criação, toggle de active, exclusão.
- [ ] 2.2 Implementar `useCategories` no `agropet-admin` que encapsula as operações CRUD contra `custom_categories`.
- [ ] 2.3 Exportar funções de matching (`isProductInCategories`) que usa categorias do banco em vez de constantes.

## 3. Botão "+" no Filter Pill (Gerenciar Produtos)

- [ ] 3.1 Escrever teste para o modal de criação de categoria: renderização, validação de campos vazios, sucesso e erro na criação.
- [ ] 3.2 Adicionar botão `+` verde-água (`#00BFA5`) com animação pulsante ao lado do rótulo "Categoria" no `ManageProductsScreen.tsx`.
- [ ] 3.3 Implementar modal de criação com campos "Nome da categoria" e "Palavras-chave" (separadas por vírgula).
- [ ] 3.4 Integrar criação com `supabase.from('custom_categories').insert(...)` e atualizar a lista local.

## 4. Subsessão "Gerenciar Categorias" no FilterModal

- [ ] 4.1 Escrever teste para o modal de gestão: listagem, toggle ativar/desativar, exclusão com confirmação, criação.
- [ ] 4.2 Adicionar subsessão "Gerenciar Categorias" no `FilterModal.tsx` abaixo de "Alertas de estoque" com botão verde (`#339914`).
- [ ] 4.3 Implementar sub-tela (modal) com lista de categorias, toggle ativar/desativar e botão excluir (com Alert de confirmação).
- [ ] 4.4 Integrar operações com Supabase e atualizar a lista em tempo real.

## 5. Substituição nos 3 Filtros

- [ ] 5.1 Escrever teste para `ManageProductsScreen` validando que as categorias vêm do banco e não de constantes.
- [ ] 5.2 **Gerenciar Produtos**: Substituir `CATEGORIES` constante e `renderTag` por fetch do `useCategories`.
- [ ] 5.3 **PDVSection**: Substituir array hardcoded e `isProductInCategories` local por fetch do `useCategories`.
- [ ] 5.4 **CatalogHeader (cliente)**: Substituir array hardcoded e `FilterContext` por fetch direto do Supabase.
- [ ] 5.5 Remover constantes `CATEGORIES`, `CATEGORY_KEYWORDS` e funções `isProductInCategories` duplicadas nos 9 arquivos.

## 6. Limpeza e Finalização

- [ ] 6.1 Rodar suite completa de testes (admin + cliente) e garantir 100% de aprovação.
- [ ] 6.2 Verificar cobertura dos novos componentes e hooks.
- [ ] 6.3 Remover arquivos/constantes não mais utilizados.
