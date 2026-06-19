## Why

Para manter o ecossistema do Agropet dinâmico, engajador e com sensação de constante atualização, precisamos de um sistema unificado de Campanhas Sazonais (Festas). Essa funcionalidade não apenas transforma visualmente a experiência do cliente em datas comemorativas, mas também introduz um fluxo inovador e altamente visual de aplicação de descontos em lote no painel de administração. Isso resolve a dor do lojista de gerenciar promoções de forma manual e maçante, melhorando simultaneamente as conversões de vendas pelo apelo estético e imersivo.

## What Changes

- **Motor Sazonal:** Implementação de um calendário lógico no código que ativará os temas festivos automaticamente baseado em intervalos de datas flexíveis (ex: Festas Longas como Natal e Halloween, vs Festas Curtas de 1 semana).
- **Admin App (Dashboard):** Adição de saudações personalizadas na dashboard (entre as boas-vindas e o contador).
- **Admin App (Gerenciamento):** Inclusão de um novo botão temático de promoção sazonal no Gerenciador de Produtos.
- **Admin App (Tags de Desconto):** Criação do fluxo de "Tags de Desconto por Cor" (Tiers). O lojista configurará múltiplos valores de desconto (ex: 40% roxo, 35% laranja) com validação de unicidade, e aplicará em lote nos produtos através de checkboxes coloridas que acompanham a seleção atual.
- **Client App (Saudação):** Mensagem temática e decorada exibida entre o filtro e o contador do catálogo.
- **Client App (Banner Dinâmico):** Injeção de banners temáticos sazonais logo acima da seção "Produtos em promoção". O texto do banner calcula automaticamente a porcentagem de desconto predominante ("maioria") associada aos produtos da campanha ativa.
- **Client App (Cards Imersivos):** Renderização temática dos Cards de Produtos (Light/Dark Mode) em todo o app (Catálogo, Carrinho, Ver Tudo). Os cards ganharão decorações (neve, cores neon, adereços de Halloween) mantendo a hierarquia visual do preço e botão intacta.
- **Admin App (Modo Preview):** Inclusão de um simulador visual (Preview Sazonal) no painel do administrador e variáveis de ambiente, permitindo forçar a visualização do catálogo e de toda a UI no tema de uma festa específica (ex: simular o Natal estando em Junho) para planejamento prévio.
- **Integração Supabase:** Criação/modificação no schema (ex: tabela `seasonal_campaigns` e junção com `products`) para armazenar e consultar rapidamente os *tiers* de descontos ativos, além de processar as lógicas de maioria de desconto. A sincronização continuará usando o fallback para SQLite local se houver arquitetura preexistente para isso.
- **Permissões de Hardware:** Nenhuma nova permissão de câmera, localização ou armazenamento local será estritamente requerida para essa funcionalidade.

## Capabilities

### New Capabilities
- `seasonal-engine`: Orquestrador de calendário responsável por determinar o estado sazonal (Natal, Halloween, Páscoa, Copa do Mundo, etc.) e expor os metadados de UI para os apps.
- `seasonal-admin-discounts`: Interface e lógica do administrador para o modo "pintura/tagging" de descontos por cor com validação de unicidade.
- `seasonal-client-ui`: Componentes visuais temáticos (Banners flutuantes, Cards texturizados, Mensagens decoradas).
- `seasonal-preview-mode`: Ferramenta de desenvolvedor/administrador para injetar e forçar uma festividade no `SeasonalProvider`, ignorando a data real do sistema.

### Modified Capabilities
- `product-catalog`: O catálogo de produtos precisará de alterações para que os produtos em promoção se inscrevam no provedor de tema sazonal e apliquem os estilos visuais festivos sobrepostos ao layout padrão, além de ler os dados de desconto consolidados pelo Supabase.

## Impact

- **UI/UX (Frontend):** Forte refatoração e sobrecarga visual nos componentes de Card, exigindo um código robusto e responsivo para não prejudicar a performance do `ScrollView/FlatList` com as novas micro-animações e SVG assets.
- **Supabase/Backend:** Necessidade de construir queries ágeis capazes de contar grupos de produtos para derivar a "maioria" no texto dinâmico dos banners.
- **UX do Lojista:** Transformação completa no paradigma de aplicação de descontos, tornando-o um processo "gamificado" e visual (seleção de tags coloridas).
