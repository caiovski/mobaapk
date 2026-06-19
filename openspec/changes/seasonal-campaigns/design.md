## Context

O aplicativo Agropet atualmente não possui uma arquitetura sistêmica para identificar períodos festivos, o que impede a injeção automática de temas imersivos e a facilidade de criação de campanhas de descontos em lote pelo lojista. A atualização das promoções sazonais é estática e unitária. O objetivo deste design é desenhar a arquitetura de estado global, a tabela de eventos no backend (Supabase), a estrutura de componentes React Native (Expo) e a técnica de "tagging colorido" no admin.

## Goals / Non-Goals

**Goals:**
- Implementar a engine de datas (Motor Sazonal) utilizando React Context (`SeasonalProvider`).
- Arquitetar os componentes visuais em React Native para suportar decorações dinâmicas (neve, neon) via SVG.
- Desenhar a arquitetura do painel de Admin permitindo a criação de *Tiers* de desconto por cor.
- Definir o schema no Supabase para relacionar produtos a campanhas e a estratégia de sincronização com o banco local (SQLite).

**Non-Goals:**
- Alterar as regras básicas de negócio de pagamento ou estoque de produtos.
- Construir um módulo de upload para que o admin envie novas artes temáticas do seu próprio celular (as decorações em vetor e SVGs serão desenvolvidas e embarcadas nativamente no bundle do app).

## Decisions

**1. Motor Sazonal no Frontend (Engine de Datas)**
*Decisão:* A lógica de mapeamento de datas festivas (`15/Out a 01/Nov` -> Halloween) será um utilitário front-end (`useSeasonalEngine`). Adicionalmente, o estado global suportará um "Override" (forçar tema) configurável via Variável de Ambiente (`EXPO_PUBLIC_FORCE_SEASON`) ou via Dropdown no Admin (Modo Preview).
*Justificativa:* Reduz chamadas de rede ao banco de dados para determinar o "Tema Visual" do App. O App sabe que é Natal pela própria data do celular/servidor local e se decora sozinho. O Supabase é acessado apenas para puxar as associações financeiras. O mecanismo de *Override* é vital para a UX do Lojista planejar campanhas e para testes TDD consistentes fora da época.

**2. Estratégia de Sincronização SQLite x Supabase**
*Decisão:* O modelo no Supabase possuirá uma tabela `seasonal_campaigns` vinculada a `products`.
*Estratégia:* No aplicativo do Cliente, ao carregar o catálogo, o sistema baixa as promoções sazonais vigentes do Supabase e atualiza/sincroniza uma tabela equivalente no SQLite local. O aplicativo tentará buscar sempre do SQLite primeiro para velocidade e suporte Offline-First, atualizando o cache via *background fetch*. No Admin App, o modo de atribuição em lote demandará conexão ativa para garantir que a *mutation* chegue ao Supabase com integridade.

**3. Arquitetura de Upload de Mídia**
*Decisão:* O upload de mídia não é aplicável neste fluxo, pois não daremos ao usuário admin o poder de subir novos layouts. Toda a UI festiva será composta por ícones, SVGs vetorizados e *Lottie Animations* contidos dentro do diretório `/assets` do Expo.

**4. Estrutura UI/UX em Componentes React Native e Fluxo de Navegação**
*Fluxos:* O admin não muda de tela para aplicar os descontos. Todo o estado "Modo Sazonal" aparece dinamicamente dentro do `Gerenciar Produtos` (expansão em Acordeon).
*Novos Componentes:*
- `SeasonalBanner.tsx` (Cliente): Exibe o desconto majoritário.
- `ThematicCardWrapper.tsx` (Cliente): Encapsula o `ProductCard` injetando as bordas de neve ou de abóboras (SVGs posicionados de forma absoluta).
- `DiscountTierBuilder.tsx` (Admin): A UI onde o admin adiciona o "+", criando campos como `40% (Roxo)`.
- `ColoredTagCheckbox.tsx` (Admin): A checkbox que, ao ser clicada, lê o estado global de "cor de tagging ativa" e aplica ao produto.

**5. Módulos Expo e Permissões**
*Decisão:* A feature não fará uso da Câmera ou Geolocalização. Nenhuma permissão de hardware será solicitada. O recurso consome exclusivamente módulos padrão de animação (`Animated`, `react-native-reanimated`) e leitura/escrita do SQLite (`expo-sqlite`).

## Risks / Trade-offs

- **[Risco] Travamentos na Lista do Admin por conta do Estado Múltiplo:** Num catálogo com milhares de produtos, atualizar as seleções do "Tagueamento por Cor" pode disparar re-renders maciços e travar a thread JS.
  - *Mitigação:* Usaremos o `@shopify/flash-list` ou aplicaremos rigorosamente o `React.memo` nos cards de administração, isolando o estado da checkbox em um reducer local, assegurando 60FPS.
- **[Risco] Cálculo de "Maioria do Desconto" Pesado no Cliente:** Buscar centenas de produtos e fazer um `.reduce()` no Javascript para achar o desconto predominante para o Banner.
  - *Mitigação:* Criaremos uma RPC (Remote Procedure Call) no Supabase chamada `get_majority_discount()`, que faz a agregação pelo lado do banco (PostgreSQL) devolvendo um JSON simples: `{ percentage: 40 }` economizando CPU do mobile.
