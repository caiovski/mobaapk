## ADDED Requirements

### Requirement: Criação de Tiers de Desconto
O administrador DEVE poder criar campos dinâmicos com percentuais diferentes e cores exclusivas, desde que os valores percentuais não se repitam.

#### Scenario: Sucesso ao adicionar múltiplos Tiers
- **DADO** que o admin clicou no botão "Nova Oferta Sazonal"
- **QUANDO** ele insere 40% no campo 1 e 35% no campo 2
- **ENTÃO** o sistema DEVE aceitar a criação e associar a cor Roxa ao 40% e Laranja ao 35%

#### Scenario: Exceção ao adicionar valores repetidos
- **DADO** que o admin já possui um Tier de 40%
- **QUANDO** ele tenta criar um novo Tier também de 40%
- **ENTÃO** o sistema DEVE exibir um erro informando que o valor já existe e bloquear a criação

### Requirement: Tagueamento de Desconto em Lote (Checkboxes Coloridas)
O administrador DEVE poder selecionar produtos massivamente clicando na checkbox correspondente, que assumirá a cor do Tier ativo.

#### Scenario: Sucesso ao pintar produtos com Tiers diferentes
- **DADO** que o admin selecionou ativamente o Tier "40% (Roxo)"
- **QUANDO** ele clica no produto X
- **ENTÃO** a checkbox do produto X fica Roxa e o Supabase recebe a instrução de desconto de 40%

#### Scenario: Exceção de falha de rede ao salvar tagueamento
- **DADO** que a internet caiu durante a sessão de tagueamento
- **QUANDO** o admin clica para taguear um produto
- **ENTÃO** o sistema DEVE notificar o erro de conexão e reverter visualmente a checkbox para o estado anterior
