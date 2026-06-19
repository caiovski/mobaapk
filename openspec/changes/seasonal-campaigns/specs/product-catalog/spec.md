## MODIFIED Requirements

### Requirement: Exibição Visual dos Cards de Produto
O catálogo DEVE renderizar a imagem, preço e botões de interação do produto, e aplicar decorações visuais da campanha sazonal ativa sobre o container base sem prejudicar a usabilidade e hierarquia das informações financeiras.

#### Scenario: Sucesso na renderização temática sem obscurecer o preço
- **DADO** que a campanha de Natal está ativa (tema light)
- **QUANDO** o catálogo renderizar um produto em promoção
- **ENTÃO** o card DEVE exibir o contorno de neve e enfeites
- **E** o preço, botões de "Ver Item" e carrinho DEVEM permanecer clicáveis e 100% legíveis

#### Scenario: Sucesso na mudança para modo escuro com tema de Halloween
- **DADO** que a campanha de Halloween está ativa e o dispositivo está em dark mode
- **QUANDO** o catálogo renderizar
- **ENTÃO** o card do produto em promoção DEVE assumir o tema com bordas neon e paleta de cores escura apropriada
