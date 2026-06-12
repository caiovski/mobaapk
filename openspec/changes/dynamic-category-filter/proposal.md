## Why

Atualmente, os 3 filtros de categoria (Catálogo no cliente, Gerenciar Produtos no admin e PDV/Registrar Venda no admin) possuem 4 categorias fixas e hardcoded — `Ração`, `Pesca`, `Sementes`, `Adubo` — com suas palavras-chave correspondentes duplicadas em 9 arquivos diferentes entre os 2 apps. Qualquer alteração (nova categoria, ajuste de keywords, remoção) exige modificar código em múltiplos lugares e publicar nova versão dos apps.

O admin precisa poder criar, editar, desativar e excluir categorias dinamicamente, sem depender de deploy. Além disso, as categorias devem ser compartilhadas entre os 3 filtros automaticamente.

## What Changes

- **Nova tabela `custom_categories` no Supabase**: Armazena nome, palavras-chave e status (ativo/inativo) de cada categoria.
- **Migração automática**: As 4 categorias atuais (Ração, Pesca, Sementes, Adubo) são inseridas na tabela com suas keywords existentes na primeira execução.
- **Substituição dos `CATEGORIES` hardcoded**: Os 3 filtros passam a consumir as categorias do banco via consulta Supabase.
- **Botão `+` verde-água pulsante**: Adicionado ao lado do rótulo "Categoria" no filter pill da tela **Gerenciar Produtos** (filtro pai). Abre um modal para criar categoria com "Nome" + "Palavras-chave".
- **Subsessão "Gerenciar Categorias" no FilterModal**: Abaixo de "Alertas de estoque", com botão verde que abre sub-tela de gestão (listar, desativar, excluir, criar).
- **Herança pai → filhos**: Catálogo (cliente) e PDV (admin) apenas leem as categorias ativas do banco. Apenas Gerenciar Produtos pode criar/gerenciar.

## Capabilities

### New Capabilities
- `custom-categories`: Gerenciamento dinâmico de categorias de produtos com nome e palavras-chave personalizáveis, armazenadas no Supabase e compartilhadas entre os filtros de Catálogo, Gerenciar Produtos e PDV.

### Modified Capabilities
- `product-category-filter` (agropet-admin e agropet-cliente): Os 3 filtros deixam de usar categorias hardcoded e passam a ler da tabela `custom_categories`.

## Impact

- **Supabase**: Nova tabela `custom_categories` (id uuid, name text, keywords text[], active boolean, created_at timestamptz). Seed automático com as 4 categorias legadas.
- **agropet-admin (Gerenciar Produtos)**: Filter pill ganha botão `+`. FilterModal ganha subsessão de gestão. Remoção das constantes `CATEGORIES` e `CATEGORY_KEYWORDS` hardcoded.
- **agropet-admin (PDVSection)**: Substituição da leitura de constante por consulta ao banco.
- **agropet-cliente (CatalogHeader)**: Substituição da leitura de constante por consulta ao banco + remoção do `CATEGORY_KEYWORDS` do `FilterContext`.
- **Remoção de ~120 linhas de código duplicado** entre os 9 arquivos que continham as mesmas constantes e lógica.
