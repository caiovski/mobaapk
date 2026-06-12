## Context

Atualmente, os 3 filtros de categoria do ecossistema Agropet usam arrays hardcoded idênticos (`['Ração', 'Pesca', 'Sementes', 'Adubo']`) e um objeto `CATEGORY_KEYWORDS` duplicado em 3 arquivos. A lógica `isProductInCategories()` está copiada em 3 lugares. Este design documenta a migração para um sistema dinâmico baseado em banco de dados.

## Goals / Non-Goals

**Goals:**
- Criar tabela `custom_categories` no Supabase para armazenar categorias criadas pelo admin.
- Migrar as 4 categorias legadas automaticamente via seed.
- Substituir as constantes hardcoded nos 3 filtros por consultas ao banco.
- Adicionar botão `+` no filter pill de Gerenciar Produtos para criação rápida de categorias.
- Adicionar subsessão "Gerenciar Categorias" no FilterModal (Gerenciar Produtos) com listagem, desativação, exclusão e criação.
- Manter a mesma aparência visual (cores, temas, formato das tags) nos 3 filtros.

**Non-Goals:**
- Categorias aninhadas ou hierárquicas.
- Ordenação customizável das categorias no filter pill.
- Criação de categorias diretamente nas telas filhas (Catálogo e PDV).

## Decisions

### 1. Armazenamento: Array de texto no Supabase

- **Decisão**: As palavras-chave serão armazenadas como `text[]` (array de texto nativo do PostgreSQL) na coluna `keywords`.
- **Formato de input do admin**: O admin digita as palavras separadas por vírgula. O app converte para array (`keywords.split(',').map(k => k.trim())`) antes de salvar.

### 2. Estrutura da tabela

```sql
create table custom_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  keywords text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed inicial (executado apenas uma vez)
insert into custom_categories (name, keywords) values
  ('Ração',    array['ração','cachorro','cachorros','canino','caninos','felino','felinos','racao','dog chow','pedigree','besser','purina','whiskas','granplus','premium','cão','cães','gato','gatos','vaca','porco','frango','galinha','galinhas']),
  ('Pesca',    array['pesca','vara','anzol','linha','molinete','boia','bóia','isca','carretilha','pescaria']),
  ('Sementes', array['semente','semeadura','sementes','girassol','milho','alpiste','grão','grãos','erva','ervas','erva-doce','ervadoce']),
  ('Adubo',    array['adubo','fertilizante','terra','substrato','humus','húmus','calpiso','calcario']);
```

### 3. Arquitetura de dados

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (custom_categories)              │
│  ┌──────┬──────────┬──────────────────────────┬────────┬──┐ │
│  │  id  │   name   │        keywords          │ active │… │ │
│  ├──────┼──────────┼──────────────────────────┼────────┼──┤ │
│  │ u1   │ Ração    │ {ração, cachorro, dog…}  │ true   │  │ │
│  │ u2   │ Pesca    │ {pesca, vara, anzol…}    │ true   │  │ │
│  │ u3   │ Sementes │ {semente, milho…}        │ true   │  │ │
│  │ u4   │ Adubo    │ {adubo, terra…}          │ true   │  │ │
│  └──────┴──────────┴──────────────────────────┴────────┴──┘ │
└─────────────────────────────────────────────────────────────┘
         ▲                        ▲                    ▲
         │  fetch ativas          │  fetch ativas      │  fetch ativas
         │                        │  + CRUD            │
┌────────┴──────────┐   ┌─────────┴──────────┐   ┌───┴──────────┐
│  Catálogo         │   │  Gerenciar Prod.   │   │  PDV         │
│  (cliente)        │   │  (admin) PAI       │   │  (admin)     │
│  FILHO            │   │  [+ Categoria]     │   │  FILHO       │
│                   │   │  [Gerenciar Categ] │   │              │
│  Apenas lê        │   │  Cria/Edita/Exc    │   │  Apenas lê   │
└───────────────────┘   └────────────────────┘   └─────────────┘
```

### 4. Botão "+" no filter pill

- **Posição**: Imediatamente à direita do rótulo "Categoria", antes do separador vertical.
- **Comportamento**: Abre um modal (bottom sheet) com 2 campos: "Nome da categoria" (TextInput) e "Palavras-chave" (TextInput, separadas por vírgula).
- **Animação**: Pulsação suave de opacidade (Animated.loop com 0.6→1→0.6, duração 2s).
- **Cor**: Verde-água (`#00BFA5`).

```
┌──────────────────────────────────────────────────────────────┐
│ [≣ Filtro ▼] │ [Categoria] [+] │ [Ração] [Pesca] [Sementes] │
└──────────────────────────────────────────────────────────────┘
```

### 5. Subsessão "Gerenciar Categorias" no FilterModal

- **Posição**: Abaixo da seção "Alertas de estoque".
- **Trigger**: Botão verde (`#339914`) com texto "Gerenciar Categorias".
- **Sub-tela (modal)**: Lista todas as categorias (ativas e inativas) com:
  - Nome da categoria
  - Palavras-chave (exibidas em formato legível)
  - Toggle ativar/desativar (switch)
  - Botão excluir (vermelho, com confirmação)
  - Botão "Nova Categoria" (verde) no topo

### 6. Função de correspondência (isProductInCategories)

A lógica atual será substituída por uma versão que recebe as categorias do banco:

```typescript
function isProductInCategories(product: any, categoryNames: string[], categories: Category[]): boolean {
  if (!categoryNames || categoryNames.length === 0) return true;
  if (!product) return false;
  const name = (product.name || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const selected = categories.filter(c => categoryNames.includes(c.name));
  return selected.some(cat =>
    cat.keywords.some(kw => name.includes(kw.toLowerCase()) || description.includes(kw.toLowerCase()))
  );
}
```

## Risks / Trade-offs

- **Latência de consulta**: A primeira carga dos filtros agora depende de uma query Supabase. Como `custom_categories` terá poucos registros (< 50), o impacto é desprezível.
- **Estado vazio**: Se o admin desativar todas as categorias ou nenhuma existir, o filter pill fica sem tags. O comportamento é intencional (cabe ao admin criar categorias).
- **Migração de dados**: O seed deve ser idempotente para não duplicar categorias em reset de banco. Usar `where not exists` ou verificar por nome antes de inserir.
