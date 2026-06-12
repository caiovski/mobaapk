## Why

Atualmente, produtos no sistema Agropet têm estoque contado em unidades inteiras (1, 2, 3...). Isso funciona bem para ração em pacotes, sachês, ferramentas de pesca, etc. Porém, não atende produtos vendidos por peso — como ração a granel, sementes a granel, ervas, adubos — onde o cliente leva "1,5 Kg" em vez de "1 pacote".

Sem essa feature, produtos à granel precisam ser cadastrados como unidades, o que causa:
- Frustração do cliente: não consegue pedir a quantidade exata que deseja
- Perda de vendas: cliente desiste ou pede quantidade errada
- Estoque irreal: admin precisa converter manualmente gramas para "unidades"
- Inconsistência: cada admin faz a conversão de um jeito

## What Changes

- **Nova coluna `is_bulk` na tabela `products`**: BOOLEAN, default false. Indica que o produto é vendido a granel (por peso).
- **Admin - Registrar produto**: Toggle "Produto à granel" no formulário. Quando ativado, o campo "Quantidade" exibe um seletor Kg/g e o valor em gramas é armazenado como `stock` (inteiro).
- **Admin - Editar produto**: Mesmo toggle e seletor, com conversão automática para gramas ao salvar.
- **Admin - Listagem (ProductCard)**: Exibir estoque como "X,XXX Kg" para produtos granel, "X unidades" para produtos normais. Alertas de estoque crítico/moderado continuam funcionando (comparação com gramas).
- **Admin - PDVSection**: Exibir "X,XXX Kg" no estoque e permitir input em Kg/g no registro de venda.
- **Cliente - Catálogo**: Exibir "X,XXX Kg" em vez de "X unidades" no estoque.
- **Cliente - ProductDetail**: Input de quantidade com seletor Kg/g + campo decimal. Converter para gramas ao adicionar ao carrinho.
- **Carrinho SQLite + Order**: `quantity` permanece INTEGER (em gramas). Nenhuma mudança de schema ou RPC necessária.

## Capabilities

### New Capabilities
- `bulk-product-catalog`: Suporte a produtos vendidos por peso (Kg/g) no cadastro, catálogo, carrinho e pedido.

### Modified Capabilities
- `product-management` (agropet-admin): Formulários de registrar/editar produto ganham toggle "Produto à granel" e seletor de unidade (Kg/g).
- `product-display` (agropet-cliente): ProductDetail exibe input decimal com seletor Kg/g para produtos granel.

## Impact

- **Supabase**: Migration para adicionar `is_bulk boolean not null default false` à tabela `products`.
- **agropet-admin (ProductCreate)**: Adicionar toggle `isBulk` + seletor Kg/g no campo quantidade. Converter para gramas no payload de insert.
- **agropet-admin (ProductEdit)**: Adicionar toggle `isBulk` + seletor Kg/g. Converter para gramas no update.
- **agropet-admin (ProductCard)**: Se `isBulk`, exibir estoque como gramas formatado em Kg.
- **agropet-admin (PDVSection)**: Exibir estoque formatado em Kg para granel; input de quantidade em Kg/g.
- **agropet-cliente (ProductDetail)**: Input decimal com seletor Kg/g. Converter valor para gramas no `addToCart`.
- **agropet-cliente (CartContext)**: Sem mudanças — `quantity` já é INTEGER e receberá gramas.
- **RPCs/Triggers**: Sem mudanças — estoque em gramas é compatível com `(v_item->>'quantity')::INTEGER` e `stock + v_item.quantity`.
- **Nenhuma migração de schema no banco SQLite do cliente**.
