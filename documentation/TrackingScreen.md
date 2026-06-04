@.agent\workflows\opsx-explore.md Certo, vamos entender o fluxo da tela TrackingScreem:

### Tracking Scree: Como ela começa?

 -  Contexto: Temos 4 etapas e 3 termômetros sendo uma das telas mais difíceis de se fazer por ser 100% em tempo real. 

 -  Primeira etapa: a primeira etapa sempre ficará com o Check-in marcado na frente pois o pedido foi confirmado (até porque só dá para acessar essa tela ou o mapa com rota depois que a pessoa fechar pedido, exceto o PIX que a pessoa precisa pagar antes já que é um método de pagamento online). Tendo isso em vista, o primeiro termômetro sempre será e brilhará em verde;

 - Segunda etapa: a segunda etapa sempre vai começar com "Pedido em preparação" com "!" amarelo na frente dele e "Pedido preparado!" com "!" vermelho na frente e na frente da etapa o "!" vermelho. Temos um relógio bem do lado, em cima dele era para estar escrito "Horário", a cor dele está certa. Essa etapa e as outras duas próximas manterão essa opacidade de começo;

 - Terceira etapa: a terceira etapa, "Saindo para entrega" e "À caminho" começarão com "!" vermelho na frente de cada um deles. O relógio teria que ser vermelho escrito "Horário" em cima. O "!" na frente dessa etapa também é vermelho;

 - Última etapa: "Entrega concluída" deve estar com "!" vermelho na frente e na frente da etapa também, o relógio na cor vermelha e em cima escrito "Horário".

Essa é a etapa que a tela se inicia.

### Tela de Ver produtos no Admin: Qual a função dela?

 - Contexto: É nessa tela que vai acontecer as ações da tela de TrackingScreen.

 - Função da tela -> Quando o Admin clicar no botão "Iniciar preparação", ele vai marcar Check-in na frente do "Pedido em preparação", o "!" vermelho na frente da etapa e do "Pedido preparado!" vai ficar amarelo e no lugar do relógio vai aparecer o exato horário no formato XX{horas} : XX{minutos} em que o admin clicou naquele botão. E também a opacidade da etapa vai aumentar para o normal e o termômetro debaixo dela vai brilhar em amarelo.
 
 - O texto "Iniciar preparação" será substituído para "Pedido preparado!" (Quando o Admin clicar nele pela primeira vez, é claro). E se o Admin clicar nesse botão novamente vai acontecer a mesma coisa só que em "Pedido preparado!" (Check-in na frente dele e vai marcar Check-in na frente da etapa) e substituir o horário antigo de "Pedido em preparação" pelo horário atual (momento em que ele clicou no botão "Pedido preparado!"), vai sumir o texto "Pedido preparado!" do botão do Admin, o botão vai trocar para a cor verde e vai ficar escrito "Saiu para a entrega". O segundo termômetro vai ficar verde.

 - Na frente de "Saiu para entrega", o "!" vermelho vai ficar amarelo. O relógio que antes era vermelho fica amarelo e ficará na espera de o Admin clicar no botão de "Saiu para a entrega".

 - Quando o Admin clicar nesse botão, a opacidade dessa terceira etapa ficará ao normal, o termômetro embaixo dela ficará brilhando da cor amarela ao invés de vermelho, o relógio será substituído pelo exato horário que o admin clicou no botão e "!" na frente de "À caminho" ficará  amarelo e o "!" da etapa também. Além de que o texto "Saiu para entrega" do botão do admin vai sumir e será substituído por "À caminho".

 - Quando o Admin clicar em "À caminho", marcará Check-in na frente de "À caminho" e na frente da etapa. O horário do "Saiu para entrega" será substituído pelo horário atual (momento em que ele clicou no botão "À caminho"), o terceiro termômetro que antes estava brilhando em amarelo, brilhará em verde e o "!" na frente de entrega concluída ficará amarelo junto com o "!" na frente da última etapa, o relógio que antes era vermelho também ficará amarelo. O botão do Admin ficará na cor verde-água indicando que mudou a etapa e está na etapa final, com o texto "Entrega concluída" (na cor branca).

 - E finalmente por fim, quando o Admin clicar nesse último botão "Entrega concluída" (na tela dele de Ver produtos), o botão ficará na cor cinza escrito "Entregue!", marcará o Check-in no lugar do "!" amarelo na frente da etapa e da "Entrega concluída" e no lugar do relógio marcará o horário exato em que o Admin clicou nesse último botão.

 - O botão cinza de "Entregue!" não tem como clicar, ficará a mesma barra pulsante azul que o cliente tem escrito Entregue na Tracking Screen (no final dela quando tudo estiver concluído) e ele poderá acessar mesmo depois de terminado através da tela Histórico de pedidos na parte Histórico de compras, quando ele clica em Detalhes, aparecerá um mini cardzinho com duas opções, Ver detalhes ou Ver situação.

 - O Admin ainda sim pode cancelar o pedido mesmo depois de concluído na tela de Consultar vendas. Se o fizer, ainda aparecerá o Pedido para o cliente no Histórico de compras com opacidade fraca e quando ele clica em Ver detalhes ou pela situação, a barrinha pulsante é cinza escrito cancelado (normal).

 ### Última observação: Quero que no começo de tudo na Tracking Screen, apareça a barra pulsante escrito: Pendente (essas barras que eu menciono que são pulsantes tem na tela de Detalhes do produto na tela de Histórico de pedidos do cliente, são 3 barras "Pendente" que é vermelha, "Entregue" que é azul e "Cancelado que é cinza").

 @.agent/workflows/opsx-apply.md 