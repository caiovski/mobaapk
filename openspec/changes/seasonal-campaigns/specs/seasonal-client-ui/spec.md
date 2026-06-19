## ADDED Requirements

### Requirement: Exibição do Banner de Desconto Dinâmico
O sistema cliente DEVE processar os produtos da campanha ativa e exibir um banner anunciando o desconto mais recorrente (maioria).

#### Scenario: Sucesso ao calcular a maioria do desconto
- **DADO** que existem 10 produtos com 40% e 2 com 35%
- **QUANDO** o banner sazonal é renderizado
- **ENTÃO** ele DEVE exibir "Maioria dos produtos com 40% de desconto"

#### Scenario: Falha ao carregar descontos do Supabase (Offline)
- **DADO** que o cliente está sem internet
- **QUANDO** ele abre o catálogo
- **ENTÃO** o app DEVE carregar o último estado salvo no SQLite e exibir o banner com as informações em cache

### Requirement: Exibição de Saudações Temáticas
O sistema cliente DEVE exibir uma mensagem temática saudando o usuário baseado na campanha sazonal ativa.

#### Scenario: Sucesso ao exibir a saudação na Home
- **DADO** que a campanha ativa é o Natal
- **QUANDO** a Home do cliente carregar
- **ENTÃO** o sistema DEVE renderizar uma saudação festiva de Natal acima do contador
