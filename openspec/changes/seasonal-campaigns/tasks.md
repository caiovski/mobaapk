## 1. Configuração do Supabase e SQLite (Backend e Cache)

- [ ] 1.1 Escrever testes (TDD) para o repositório de campanhas no Supabase (mockando a API e a RPC de maioria)
- [ ] 1.2 Implementar migrations e criação da função RPC `get_majority_discount` no Supabase
- [ ] 1.3 Escrever testes unitários (TDD) para o repositório local `SeasonalRepository` no SQLite simulando cenários offline
- [ ] 1.4 Implementar `SeasonalRepository` (escrita, leitura e fallback)
- [ ] 1.5 Escrever testes (TDD) simulando a sincronização (Supabase -> SQLite) e captura de exceções de timeout de rede
- [ ] 1.6 Implementar o serviço de sincronização com tratamento de erros `try/catch` e logging

## 2. Motor Sazonal (Frontend Engine)

- [ ] 2.1 Escrever testes (TDD) garantindo que as datas festivas retornam o metadado correto simulando mocks de `new Date()`
- [ ] 2.2 Implementar a estrutura de regras (datas de longo e curto prazo) no utilitário `seasonalEngine.ts`
- [ ] 2.3 Escrever testes (TDD) para o React Context `SeasonalProvider` validando o estado global
- [ ] 2.4 Escrever testes (TDD) garantindo que a injeção da variável `FORCE_SEASON` altera o tema ignorando a data real
- [ ] 2.5 Implementar `SeasonalProvider` encapsulando a raiz da aplicação com suporte a Modo Preview via Context Override

## 3. UI/UX do Painel Administrativo

- [ ] 3.1 Escrever testes (TDD) para o `DiscountTierBuilder` garantindo o bloqueio de percentuais repetidos (exceção de UI)
- [ ] 3.2 Implementar `DiscountTierBuilder.tsx` para gerenciar os "baldes" de desconto e suas cores vinculadas
- [ ] 3.3 Escrever testes (TDD) validando que a `ColoredTagCheckbox` herda a cor do Tier selecionado no pai
- [ ] 3.4 Implementar `ColoredTagCheckbox.tsx` nos cards da lista "Gerenciar Produtos" com estado otimizado (`React.memo`)
- [ ] 3.5 Escrever testes (TDD) de integração do clique no botão "Salvar" simulando erro 500 para acionar rollback visual
- [ ] 3.6 Implementar o fluxo de salvamento em lote (Batch update) com tratamento de erro (Toasts e reversão de estado)
- [ ] 3.7 Implementar componente visual de "Simulador / Preview Sazonal" no topo do gerenciador para ativar o Override local

## 4. UI/UX do Cliente

- [ ] 4.1 Escrever testes (TDD) garantindo o cálculo do desconto majoritário no `SeasonalBanner`
- [ ] 4.2 Implementar o `SeasonalBanner.tsx` dinâmico na tela de Catálogo
- [ ] 4.3 Escrever testes (TDD) validando a injeção da saudação temática dinâmica acima do contador da Home
- [ ] 4.4 Implementar a Mensagem de Saudação Personalizada no catálogo
- [ ] 4.5 Escrever testes visuais/snapshot (TDD) para `ThematicCardWrapper` garantindo visibilidade do preço (Z-index correto)
- [ ] 4.6 Implementar `ThematicCardWrapper.tsx` consumindo vetores SVG (neve, adereços) e cores neon/glow via `useTheme`
- [ ] 4.7 Validação e tratamento de erros visuais: garantir legibilidade total entre modos Dark e Light
