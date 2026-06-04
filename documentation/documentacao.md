# Revisões Técnicas - AgroPet Lambari 🐶🐱


#### 1 - "O usuário clicou em pagar duas vezes. Como você evita chamadas duplicadas na API?  "

## Da forma mais simples 👇

- **1️⃣ Chave de Idempotência (a mais importante)**

Cada tentativa de pagamento recebe um ID único.
👉 Se o usuário clicar em Pagar duas vezes
👉 As duas requisições enviam o mesmo ID
👉 O backend processa apenas uma vez
📌 É assim que plataformas de pagamento sérias trabalham.

- **2️⃣ Desabilitar botão / Debounce (camada do front)**

Depois do primeiro clique em Pagar:
👉 Desabilite o botão
👉 Mostre loading
👉 Ou aplique um pequeno delay entre cliques
📌 Isso reduz requisições duplicadas antes mesmo de chegar no backend.

- **3️⃣ Regra única no banco de dados**

Crie uma restrição única para campos como order_id e payment_id.
👉 Se a mesma transação chegar de novo
👉 O banco bloqueia automaticamente
📌 Última linha de defesa.

- **4️⃣ Deduplicação em filas (Kafka / SQS / async)**

Em sistemas assíncronos:
👉 Cada mensagem possui um ID
👉 A mesma mensagem é consumida só uma vez
👉 Mesmo que seja reenviada várias vezes
📌 Essencial em arquiteturas distribuídas.
🚨 Resumo:
1. Frontend evita cliques extras
2. Backend garante segurança com idempotência
3. Banco e filas protegem contra duplicidade
O problema não foi o usuário — foi você que não implementou idempotência.


### 2 - Sua API responde em 200ms em São Paulo mas leva 1.5s no Nordeste. Por que isso acontece e como você resolve?

## Da forma mais simples 👇

Resposta = Latência Geográfica ✅
Mais distância = mais saltos de rede = respostas mais lentas.

1️⃣ **Distância de rede é a causa raiz**

Se seu backend está hospedado em São Paulo, usuários do Nordeste precisam enviar requisições por longas distâncias.
Mesmo com código rápido, o tempo de viagem na rede domina.

2️⃣ **Use CDN para conteúdo estático**

Assets estáticos são servidos pelo servidor mais próximo do usuário.
Usuários de Manaus não precisam buscar arquivos de São Paulo.

3️⃣ **Deploy multi-região**

Rode serviços de backend em múltiplas regiões (São Paulo + Norte/Nordeste).
As requisições automaticamente atingem a região mais próxima.

4️⃣ **Cache de dados próximo ao usuário**

Dados muito acessados ficam em cache no nível de edge ou região.
A mesma resposta não precisa cruzar o país toda vez.

5️⃣ **Otimize o acesso ao banco por região**

Read replicas por região.
Evite chamadas cross-region no banco em rotas críticas.

6️⃣ **Trate falhas de forma resiliente**

Timeouts, retries e fallbacks evitam experiências ruins durante instabilidades de rede.


### 3 - Seu sistema caiu as 03:00 AM e ninguém acordou para resolver. Como você evita isso? 

## Da forma mais simples 👇

Imagina você dormindo tranquilo numa sexta à noite.
Seu celular não vibrou. Nenhum alerta.
Mas sua API caiu às 3h e ficou 2 horas retornando 500 pra todo mundo.
Na manhã seguinte você abre o Slack…
😶
Isso é sistema sem Observabilidade.

🔴 **O problema real:**

Sua API pode estar caída agora e você não sabe.
Sem monitoramento, quem descobre primeiro é o usuário.
E ele não vai te mandar um relatório técnico — ele vai embora.

1️⃣ **Health Check na API**

👉 Endpoint /health que responde se o sistema tá vivo.
→ Verifica conexão com banco, cache e dependências externas
→ Retorna 200 se tudo ok, 503 se algo caiu
📌 Primeiro sinal de vida que qualquer sistema precisa ter.

2️⃣ **Alertas automáticos**

👉 Se a API parar de responder ou latência subir → você recebe alerta imediato.
→ Configura threshold: mais de 3 erros 500 em 1 minuto = acorda todo mundo
→ PagerDuty, Grafana, CloudWatch, Datadog fazem isso
📌 Você dorme. O sistema te avisa se precisar.

3️⃣ **Circuit Breaker**

👉 Se um serviço dependente começa a falhar → sua API para de chamar ele automaticamente.
→ Evita efeito cascata: um serviço caindo derruba todos os outros
→ Resilience4j faz isso no Spring Boot em poucas linhas
📌 Sua API sobrevive mesmo quando o vizinho cai.

4️⃣ **Retry com Backoff Exponencial**

👉 Falhou uma vez? Tenta de novo. Mas com inteligência.
→ Primeira tentativa: aguarda 1s
→ Segunda: aguarda 2s
→ Terceira: aguarda 4s
→ Desiste e retorna erro controlado
📌 Evita sobrecarregar um serviço que já tá no limite.

5️⃣ **Logs estruturados**

👉 Quando der erro, você precisa saber exatamente o que aconteceu.
→ Log com timestamp, user_id, endpoint, status code e tempo de resposta
→ Sem isso você fica no escuro tentando adivinhar o problema
📌 Log ruim é pior que nenhum log — te dá falsa sensação de controle.

⚠️ O erro clássico de dev júnior:
Só descobrir que a API caiu quando o cliente reclama.
Monitoramento não é opcional — é a diferença entre resolver em 5 minutos ou em 2 horas.


### 4 - Seu sistema tem autenticação perfeita. Mas qualquer usuário consegue ver os dados de qualquer outro. O que está errado?  

## Da forma mais simples 👇

Isso tem nome: falha de autorização.
E é uma das vulnerabilidades mais comuns em sistemas reais.

- **1️⃣ O que aconteceu**

👉 Autenticação verifica quem você é.
👉 Autorização verifica o que você pode acessar.
→ Você implementou o login direitinho
→ Mas esqueceu de validar se o recurso pertence a quem está pedindo
📌 Resultado: usuário autenticado acessando dados de outro usuário.

- **2️⃣ Como isso aparece no código**

👉 Endpoint sem verificação de dono:
→ GET /usuarios/123/dados
→ Qualquer usuário logado consegue trocar o 123 por qualquer número
→ Sem nenhum bloqueio
📌 Isso se chama IDOR — Insecure Direct Object Reference.

- **3️⃣ Como corrigir**

👉 Nunca confie no ID que vem na requisição.
→ Pega o ID do usuário direto do token JWT
→ Compara com o dono do recurso no banco
→ Se não bater → 403 Forbidden
📌 O usuário nunca deveria controlar qual dado ele acessa.

- **4️⃣ Códigos HTTP que importam aqui**

👉 401 → sistema não te reconhece
👉 403 → sistema te conhece, mas você não tem permissão
📌 Retornar 401 pra tudo é errado e esconde o problema real.

- **5️⃣ Exemplo real**
→ Usuário A loga no sistema ✅
→ Muda o ID na URL e acessa dados do Usuário B ❌
→ Autenticação passou. Autorização inexistente.

⚠️ O erro clássico:
Achar que autenticação resolve tudo.
Ela só prova quem você é — não o que você pode fazer.
São camadas diferentes e precisam estar separadas no código.


### 5 - Você colocou rate limiting na API. Mas um atacante ainda consegue fazer mil requisições por segundo usando múltiplos IPs. O que está errado?

## Da forma mais simples 👇

Rate limiting por IP é a primeira coisa que todo dev implementa.
E é a primeira coisa que todo atacante burla.
Alugou 1000 IPs diferentes na nuvem por centavos e tá feito. 🤡

- **1️⃣ O problema do rate limiting por IP**

👉 Você limita 100 req/s por IP.
→ Atacante usa 100 IPs diferentes
→ São 10.000 req/s no total
→ Seu limite não serviu pra nada
📌 IP é fácil de trocar. Não pode ser sua única defesa.

- **2️⃣ Rate limiting por usuário autenticado**

👉 Usa o user_id extraído do token como chave do limite.
→ Não importa de qual IP veio a requisição
→ O limite segue o usuário, não o endereço
📌 Muito mais difícil de burlar.

- **3️⃣ Rate limiting por API Key**

👉 Cada cliente da sua API tem uma chave única.
→ O limite é aplicado na chave, não no IP
→ Chave comprometida? Revoga e gera outra
📌 Padrão em APIs públicas como GitHub e Stripe.

- **4️⃣ Análise de comportamento**

👉 Analisa o padrão da requisição, não só de onde veio.
→ Mesmo user-agent em IPs diferentes
→ Intervalo idêntico entre requisições
→ Sequência suspeita de endpoints acessados
📌 Bot tem comportamento previsível. Use isso contra ele.

- **5️⃣ CAPTCHA progressivo**

👉 Não bloqueia de cara,
→ Comportamento suspeito detectado → exige CAPTCHA
→ Continua suspeito → bloqueia
📌 Usuário real passa. Bot trava.

- **6️⃣ Combinação é a chave**

👉 Nenhuma técnica sozinha resolve.
→ Rate limit por usuário + análise + CAPTCHA progressivo
→ Cada camada elimina um tipo de ataque diferente
📌 Segurança em profundidade.

⚠️ O erro clássico:
Implementar rate limiting por IP e achar que tá protegido.
IP é o dado mais fácil de falsificar na internet.


### 6 - Dois usuários editaram o mesmo documento ao mesmo tempo. Como o sistema decide qual versão salvar?

## Da forma mais simples 👇

Usuário A abre o documento às 14h.
Usuário B abre o mesmo documento às 14h.
Os dois editam. Os dois salvam.
Qual versão fica? 🤔
Isso tem nome: conflito de concorrência.

- **1️⃣ Optimistic Locking**

👉 O sistema assume que conflito é raro e não bloqueia ninguém.
→ Cada registro tem um campo de versão no banco
→ Usuário A salva com versão 1 → vira versão 2
→ Usuário B tenta salvar com versão 1 → sistema rejeita
→ B recebe erro e precisa recarregar antes de salvar
📌 Ótimo quando conflito é raro. Sem bloqueio, sem fila.

- **2️⃣ Pessimistic Locking**

👉 O sistema assume que conflito vai acontecer e bloqueia o recurso.
→ Usuário A abriu o documento → ninguém mais consegue editar
→ A salvou → bloqueio liberado → B pode editar agora
📌 Garante consistência total, mas cria fila de espera.

- **3️⃣ Merge automático (como o Google Docs faz)**

👉 Os dois editam ao mesmo tempo e o sistema tenta juntar as alterações.
→ A editou o parágrafo 1, B editou o parágrafo 2 → sem conflito, merge automático
→ Os dois editaram a mesma linha → sistema destaca o conflito pra resolver manualmente
📌 Melhor experiência pro usuário, mas mais complexo de implementar.

- **4️⃣ Última escrita ganha**

👉 A última versão salva simplesmente sobrescreve tudo.
→ Simples de implementar
→ Mas perigoso: o trabalho de um usuário some sem aviso
📌 Só aceitável em dados onde perder uma versão não importa.

⚠️ O erro clássico:
Não pensar em concorrência e usar “última escrita ganha” sem querer.
A maioria dos bugs silenciosos de perda de dado vem disso.


### 7 - Usuários confirmou o Pix, o dinheiro saiu mas o pedido não foi gerado. O que aconteceu?

## Da forma mais simples 👇

Usuário confirma o Pix.
Dinheiro sai na hora.
Abre o app de novo. Pedido não tá lá.
Abre o banco. Dinheiro saiu. 🫠
Isso tem nome: falha de consistência entre sistemas.

- **1️⃣ O que aconteceu de verdade**

👉 O pagamento e o pedido são sistemas separados.
→ Pagamento processou e confirmou
→ Na hora de criar o pedido a conexão caiu
→ Um lado confirmou. O outro não soube.
📌 Sem tratamento, o dinheiro some e o pedido não existe.

- **2️⃣ Transação distribuída**

👉 Os dois sistemas precisam confirmar juntos ou desfazer juntos.
→ Pagamento confirmou mas pedido falhou → pagamento é estornado automaticamente
→ Ou os dois confirmam, ou nenhum confirma
📌 Tudo ou nada. Sem meio termo.

- **3️⃣ Retry automático com idempotência**

👉 Quando a conexão cai, o sistema tenta de novo automaticamente.
→ Mas precisa garantir que a mesma operação não seja executada duas vezes
→ Cada tentativa carrega o mesmo ID único
→ Sistema reconhece que já processou e não cobra de novo
📌 Sem isso o retry vira cobrança dupla.

- **4️⃣ Status intermediário**

👉 O pedido nunca fica em estado desconhecido.
→ Pagamento confirmado mas pedido pendente → fica como “processando”
→ Job em background verifica e resolve
→ Confirmou tudo → pedido ativo. Falhou → estorno automático
📌 O usuário sempre sabe o que tá acontecendo.

- **5️⃣ Fila de mensagens como garantia**

👉 O pagamento publica um evento numa fila antes de qualquer coisa.
→ Mesmo que tudo caia, o evento tá lá esperando
→ Quando o sistema voltar, processa do ponto que parou
📌 Mensagem na fila não some. Conexão cai, fila aguenta.

- **6️⃣ O que fazer agora**

👉 Analisar logs e rastrear o pedido pelo ID único.
→ Se o pagamento foi confirmado e o pedido nunca foi criado → estorno manual ou automático
→ Se o pedido está em processamento → investigar erro de criação
→ Se o pagamento não foi confirmado → aguardar confirmação ou estorno
📌 O importante é nunca deixar o usuário no vácuo.

⚠️ O erro clássico:
Chamar pagamento e criação de pedido em sequência sem nenhuma garantia entre os dois.
Funciona em desenvolvimento. Quebra em produção na pior hora possível.


### 8 - Seu banco de dados tá com 500 milhões de registros. Uma query simples leva 8 segundos. O que você faz?

## Da forma mais simples 👇

8 segundos de espera no seu app.
Usuário já fechou e foi pro concorrente.
Isso não é problema de hardware.
É problema de como você tá consultando o banco. 📉

- **1️⃣ Índice na coluna certa**

👉 Sem índice o banco lê registro por registro até achar o que você quer.
→ 500 milhões de registros = 500 milhões de leituras
→ Com índice o banco vai direto no dado
→ Query de 8 segundos vira milissegundos
📌 Primeiro lugar que todo dev deveria olhar.

- **2️⃣ Analisa o plano de execução**

👉 Antes de qualquer coisa roda um EXPLAIN na query.
→ O banco te mostra exatamente o que tá fazendo por baixo
→ Full table scan aparece aqui
→ Você vê onde tá o gargalo antes de sair chutando solução
📌 Diagnóstico antes de remédio.

- **3️⃣ Paginação nos resultados**

👉 Nunca busca 500 milhões de registros de uma vez.
→ Retorna 20, 50, 100 por vez
→ Banco processa menos, resposta chega mais rápido
→ Usuário nem percebe que tem 500 milhões atrás
📌 Simples e resolve boa parte dos casos.

- **4️⃣ Particionamento da tabela**

👉 Divide a tabela gigante em partes menores por critério lógico.
→ Por data, por região, por categoria
→ Query vai direto na partição certa
→ Em vez de varrer 500 milhões varre só 10 milhões
📌 Transparente pra aplicação, enorme ganho no banco.

- **5️⃣ Cache nos resultados frequentes**

👉 Se a mesma query roda mil vezes por dia o banco não precisa responder mil vezes.
→ Primeira execução vai no banco e guarda no Redis
→ As próximas pegam do cache
→ Zero impacto no banco
📌 Dado que não muda toda hora não precisa ser consultado toda hora.

⚠️ O erro clássico:
Jogar mais hardware no problema achando que resolve.
Servidor mais potente com query ruim continua lento.
Otimiza a query antes de escalar a infraestrutura.


### 9 - Seu app ta no limite. Você tem duas opções: comprar um servidor maior ou adicionar mais serviores. Qual você escolhe e por quê?

## Da forma mais simples 👇

Seu app tá lento. Usuários reclamando.
Chefe quer solução rápida.
Você tem duas opções na mesa.
A escolha errada vai te custar caro lá na frente. 📉

- **1️⃣ Escala vertical — comprar um servidor maior**

👉 Você pega a mesma máquina e aumenta os recursos.
→ Mais CPU, mais memória, mais disco
→ Rápido de implementar, zero mudança no código
→ Mas tem um limite físico — não existe servidor infinito
📌 Resolve no curto prazo. Não escala pra sempre.

- **2️⃣ Escala horizontal — adicionar mais servidores**

👉 Em vez de uma máquina grande você usa várias menores.
→ Chegou mais tráfego? Sobe mais uma instância
→ Tráfego caiu? Derruba e para de pagar
→ Sem limite teórico de crescimento
📌 É assim que Instagram, Netflix e Nubank funcionam.

- **3️⃣ O problema da escala horizontal**

👉 Sua aplicação precisa estar preparada pra isso.
→ Sessão do usuário não pode ficar salva em memória local
→ Cada servidor precisa conseguir atender qualquer requisição
→ Precisa de um load balancer na frente distribuindo o tráfego
📌 Não é só subir mais servidores. O código precisa permitir.

- **4️⃣ Quando usar cada uma**

👉 Escala vertical: sistema legado, solução rápida, curto prazo
👉 Escala horizontal: produto em crescimento, precisa de disponibilidade alta
📌 A maioria dos sistemas começa vertical e migra pro horizontal conforme cresce.

⚠️ O erro clássico:
Ficar escalando verticalmente até chegar no limite da máquina.
Aí você precisa refatorar o código sob pressão com o sistema já no limite.


### 10 - Último item no estoque. Duas pessoas clicam em comprar ao mesmo tempo. O que o sistema faz? (Já feito!)

## Da forma mais simples 👇

Black Friday. Último PlayStation na promoção.
Você e mais alguém clicam em comprar no mesmo segundo.
Os dois recebem confirmação de compra.
Só tinha um. 😬
Isso tem nome: condição de corrida.

- **1️⃣ Lock no estoque**

👉 Quando alguém inicia a compra o sistema reserva o item.
→ Usuário A clicou → item travado
→ Usuário B clicou → item indisponível
→ A confirmou → venda concluída
→ A desistiu → item liberado de volta
📌 Só um usuário por vez chega na finalização.
    
- **2️⃣ Operação atômica no banco**

👉 Verificação e reserva acontecem em uma única operação.
→ Verifica se tem estoque E decrementa ao mesmo tempo
→ Se dois usuários tentarem simultaneamente só um consegue
→ O banco garante isso sozinho
📌 Sem esse cuidado os dois passam pela verificação antes de qualquer um decrementar.

- **3️⃣ Reserva temporária**

👉 Item reservado por tempo limitado enquanto o usuário finaliza.
→ Colocou no carrinho → 10 minutos pra pagar
→ Não pagou → item volta pro estoque automaticamente
→ Pagou → venda confirmada
📌 É exatamente assim que ingresso de show funciona.

- **4️⃣ Fila de espera**

👉 Mais de uma pessoa querendo o mesmo item ao mesmo tempo.
→ Primeiro a confirmar o pagamento fica com o produto
→ Segundo entra numa fila e é avisado se o item voltar
📌 Experiência melhor do que simplesmente negar a compra.

⚠️ O erro clássico:
Verificar o estoque e só depois reservar em operações separadas.
Nesse intervalo de milissegundos dois usuários passam ao mesmo tempo e você vende o que não tem.


### 11 - Seu código funciona na sua máquina. No servidor dá erro. Na máquina do colega não roda. O que está errado?

## Da forma mais simples 👇

Versão diferente.
Dependência faltando.
Configuração errada.
Deploy parou tudo.
Isso não é bug, é problema de ambiente.

- **1️⃣ O que é um container**

👉 Uma caixa com tudo que seu código precisa pra rodar.
→ Código, dependências, configurações de ambiente
→ Tudo junto, isolado, empacotado
📌 Se roda aqui, roda em qualquer lugar.

- **2️⃣ Por que isso resolve o problema**

👉 Todo mundo roda a mesma caixa.
→ Seu notebook
→ Máquina do colega
→ Servidor de produção
→ Cloud
📌 Mesmo container. Mesmo resultado. Sempre.

- **3️⃣ Sem container o que acontece**

👉 Cada ambiente tem sua própria configuração.
→ Java 17 aqui, Java 11 lá
→ Variável de ambiente diferente
→ Biblioteca com versão diferente
📌 Funciona em um lugar, quebra no outro. Ninguém sabe por quê.

- **4️⃣ Por que virou padrão de mercado**

👉 Time inteiro rodando o mesmo ambiente elimina problema bobo.
→ Menos tempo debugando ambiente
→ Mais tempo entregando feature
→ Deploy previsível e consistente
📌 É por isso que toda vaga sênior pede Docker hoje em dia.

⚠️ O erro clássico:
Ficar horas debugando erro que não é do código.
Era só a versão do Java diferente no servidor.


### 12 - Seu sistema precisa enviar email, notificação e atualizar estoque quando uma compra é feita. Como você garante que tudo isso acontece?

## Da forma mais simples 👇

Compra confirmada.
Sistema tenta enviar email — falhou.
Tenta notificação — falhou.
Estoque nem atualizou.
Usuário recebeu confirmação de uma compra que o sistema não processou direito. 😤

- **1️⃣ O problema de fazer tudo na mesma requisição**

👉 Email, notificação e estoque na mesma chamada.
→ Um falha → você desfaz tudo ou ignora o erro?
→ Usuário fica esperando os 3 terminarem
→ Quanto mais serviços, mais lenta a resposta
📌 Acoplamento direto é frágil e lento.

- **2️⃣ Fila de mensagens resolve isso**

👉 Compra confirmada → publica um evento na fila → responde o usuário na hora.
→ Serviço de email consome o evento e envia
→ Serviço de notificação consome e notifica
→ Serviço de estoque consome e atualiza
📌 Cada um processa no seu tempo sem travar o usuário.

- **3️⃣ E se um serviço falhar?**

👉 A mensagem fica na fila esperando.
→ Serviço de email caiu → mensagem aguarda
→ Voltou → processa do ponto que parou
→ Nada se perde
📌 Fila é memória. Serviço caído não perde mensagem.

- **4️⃣ Dead Letter Queue**

👉 Tentou processar várias vezes e continuou falhando.
→ Mensagem vai pra uma fila separada de erros
→ Você analisa o problema sem perder o evento
→ Corrigiu → reprocessa
📌 Nenhuma compra cai no esquecimento.

- **5️⃣ Ordem de processamento**

👉 Às vezes a ordem importa.
→ Não pode notificar antes de atualizar o estoque
→ Fila garante que as mensagens são consumidas na ordem certa
📌 Cada serviço sabe exatamente quando é a sua vez.

⚠️ O erro clássico:
Chamar email, notificação e estoque em sequência na mesma requisição.
Um serviço lento atrasa todos os outros e o usuário paga o preço.

### 13 - Você fez deploy na sexta às 17h. Em 10 minutos 500 usuários recebendo erro. O que você faz?

## Da forma mais simples 👇

Sexta. 17h. Você sobe aquela alteração pequena em produção
Notificação. Outra. Mais uma.
500 usuários com erro

- **1️⃣ Primeiro passo: rollback imediato**

👉 Não tenta debugar em produção com usuário sofrendo.
→ Volta pra versão anterior que tava funcionando
→ Sistema volta ao normal em minutos
→ Aí sim você senta pra entender o que aconteceu
📌Nada importa mais que estabilidade do sistema.

- **2️⃣ Feature flag**

👉 Você não precisava subir pra todo mundo de uma vez.
→ Ativa a feature pra 1% dos usuários primeiro
→ Monitorou por 30 minutos sem erro → abre pra mais
→ Deu problema → desativa a flag sem precisar de deploy
📌 Problema afeta 1% não 100%.

- **3️⃣ Deploy gradual**

👉 Nova versão sobe em paralelo com a antiga.
→ 5% do tráfego vai pra nova versão
→ Resto continua na versão estável
→ Tudo ok → migra gradualmente
→ Erro → para tudo antes de afetar mais ninguém
📌 Produção real com risco controlado.

- **4️⃣ Health check automático**

👉 Sistema monitora a nova versão sozinho.
→ Taxa de erro subiu → rollback automático
→ Latência aumentou → rollback automático
→ Sem precisar de ninguém olhando
📌 Você podia ter ido embora às 17h mesmo.

- **5️⃣ O que fazer enquanto resolve**

👉 Comunicação é tão importante quanto a solução técnica.
→ Avisa o time antes de qualquer coisa
→ Status page atualizada pra usuário não ficar no escuro
→ Documenta o que aconteceu depois que resolver
📌 Silêncio em incidente é pior que o incidente.

⚠️ O erro clássico:
Fazer deploy na sexta à tarde sem feature flag, sem health check.
Funciona até o dia que não funciona.

### 14 - Seu banco de dados estava lento. Você adicionou índices em tudo. Ficou ainda mais lento. O que aconteceu?

## Da forma mais simples 👇

Query lenta. Você adiciona índice.
Ainda lento. Adiciona mais um.
E mais um.
O banco ficou pior.
Isso acontece mais do que parece.

- **1️⃣ Por que índice demais é problema**

👉 Índice acelera leitura mas pesa na escrita.
→ Cada INSERT, UPDATE ou DELETE precisa atualizar todos os índices
→ Tabela com 10 índices faz 10 operações extras a cada escrita
→ Banco de dados com muita escrita sofre mais com índice do que sem
📌 Índice não é gratuito. Tem custo.

- **2️⃣ Índice na coluna errada**

👉 Não adianta indexar qualquer coluna.
→ Índice em coluna com poucos valores distintos não ajuda
→ Exemplo: coluna “status” com apenas “ativo” e “inativo”
→ O banco ainda varre metade da tabela de qualquer jeito
📌 Índice bom é em coluna com alta cardinalidade.

- **3️⃣ Índice composto na ordem errada**

👉 A ordem das colunas no índice composto importa.
→ Índice em (status, created_at) não serve pra query que filtra só por created_at
→ Precisa respeitar a ordem do índice
📌 Índice ignorado é igual a não ter índice.

- **4️⃣ Como diagnosticar de verdade**
👉 Antes de criar qualquer índice roda o EXPLAIN na query.
→ Mostra se tá fazendo full table scan
→ Mostra quais índices tão sendo usados
→ Mostra quais tão sendo ignorados
📌 Diagnóstico antes de remédio. Sempre.

- **5️⃣ Índice não usado vira lixo**

👉 Banco tem índices que nunca são consultados.
→ Ocupam espaço em disco
→ Pesam em toda operação de escrita
→ Não ajudam ninguém
📌 Índice inútil é pior que ausência de índice.

- **6️⃣ Tipos de índice mais comuns**

👉 Não existe um índice pra tudo.
→ B-Tree → o padrão, bom pra buscas por intervalo e ordenação
→ Hash → busca exata rapidíssima, mas não serve pra “maior que” ou “menor que”
→ Full-text → busca textual, tipo “encontra todos os produtos com iPhone no nome”
📌 Escolha errada de tipo é tão ruim quanto índice na coluna errada.

⚠️ O erro clássico:
Sair adicionando índice em tudo achando que só tem vantagem.
Índice é ferramenta cirúrgica. Não é solução genérica.


### 15 - Como o Google Drive sabe que você editou um arquivo offline e sincroniza tudo quando a internet volta?

## Da forma mais simples 👇

- **1️⃣ Armazenamento local primeiro**

👉 Toda alteração é salva localmente antes de qualquer coisa.
→ Sem internet o app continua funcionando normalmente
→ Cada alteração fica numa fila local esperando conexão
→ Internet voltou → fila é processada
📌 O app nunca depende da internet pra deixar você trabalhar.

- **2️⃣ Registro de alterações com timestamp**

👉 Cada alteração carrega data e hora exata.
→ Você editou offline às 14h32
→ Colega editou online às 14h45
→ Sistema sabe a ordem cronológica de cada mudança
📌 Timestamp é a base de qualquer sincronização.

- **3️⃣ Merge automático**

👉 Você e seu colega editaram partes diferentes do mesmo arquivo.
→ Você alterou o parágrafo 1
→ Ele alterou o parágrafo 3
→ Sistema junta as duas versões automaticamente
📌 Nenhuma alteração se perde.

- **4️⃣ Conflito de edição**

👉 Os dois editaram a mesma linha ao mesmo tempo.
→ Sistema não decide sozinho quem tá certo
→ Marca o conflito e mostra as duas versões
→ Usuário escolhe qual manter
📌 Dado importante demais pra sistema decidir sozinho.

- **5️⃣ Sincronização incremental**

👉 Não envia o arquivo inteiro toda vez que salva.
→ Só as partes que mudaram são enviadas
→ Arquivo de 100MB com 2 linhas editadas → envia só essas 2 linhas
→ Economiza banda e sincroniza mais rápido
📌 É por isso que sincroniza em segundos mesmo com arquivo grande.

⚠️ O erro clássico:
Assumir que o usuário sempre vai ter internet e não tratar o estado offline.
Aplicação que depende de conexão pra funcionar perde usuário na primeira falha.


### 16 - No AgroPetLambari, como o usuário sabe que o pedido foi enviado, processado ou entregue?

## Da forma mais simples 👇

- **1️⃣ Atualização em tempo real**

👉 O status muda assim que a ação acontece no sistema.
→ Cliente pede → status muda pra "processando"
→ Admin envia → status muda pra "enviado"
→ Entregador confirma → status muda pra "entregue"
📌 Usuário vê a mudança segundos depois de acontecer.

- **2️⃣ Notificações push via fila de banco**

👉 Quando o admin avança o status, o banco dispara automaticamente.
→ Trigger `trg_notify_order_status` detecta mudança no campo `status` de `orders`
→ Insere a notificação na fila `notification_queue` com título e corpo corretos
→ Edge function `send-push` consome a fila e envia via Expo Push API
→ Cliente recebe "Seu pedido saiu para entrega! 🛵" mesmo com o app fechado
📌 Zero polling. Zero intervenção manual — o admin só avança o status e o cliente é notificado automaticamente.

- **3️⃣ Histórico de pedidos com status visual**

👉 Cada pedido tem uma linha do tempo visual.
→ Pedido feito
✔ Processando
📦 Enviado
🏁 Entregue
📌 O usuário entende todo o ciclo do pedido de uma olhada.

- **4️⃣ Cores diferentes para cada status**

👉 Amarelo = processando
👉 Laranja = enviado
👉 Verde = entregue
📌 É fácil identificar o que cada pedido precisa.

- **5️⃣ O que fazer se der problema**

👉 Se passar do tempo esperado o app alerta.
→ "Seu pedido deveria ter sido enviado há 30 minutos. Entre em contato com a loja." ⚠️
→ Botão de "ligar para a loja" direto da tela do pedido 📞
📌 O cliente se sente seguro mesmo se algo sair do padrão.

⚠️ **Gap conhecido:** A `TrackingScreen` exibe uma timeline visual estática com ícones e cores para cada etapa (Confirmado → Preparação → Saiu para Entrega → Concluído). No estado atual os horários são fixos no layout. O próximo passo natural seria conectá-la ao `order_status` real via Supabase Realtime, refletindo as transições em tempo real sem precisar fechar e reabrir o app.


### 17 - Sua API está recebendo 10.000 requisições por segundo de um único usuário. Como você impede isso sem derrubar o sistema?

## Da forma mais simples 👇

Imagina um guichê de banco com 1 atendente.
Um cliente chega e quer resolver 500 coisas de uma vez.
A fila para. O atendente trava. Ninguém mais é atendido.
Isso é sua API sem Rate Limiting. 🏦

- **1️⃣ O problema real**

👉 Um bot inunda seu servidor com milhares de requisições por segundo.
O servidor esgota threads, memória cai, e todo usuário real recebe erro 500.
📌 É assim que sistemas caem no pior momento possível.

- **2️⃣ A solução — Token Bucket**

👉 Cada usuário recebe um balde com tokens.
→ Cada requisição consome 1 token
→ O balde reabastece automaticamente com o tempo
→ Sem tokens? Requisição bloqueada. HTTP 429 retornado.
→ Usuário legítimo nunca percebe que existe ⚡
📌 Simples, eficiente e usado por todo sistema sério.

- **3️⃣ Como funciona em produção (com Redis)** (Nesse caso, como é um projeto solo, não é necessário implementá-lo. Uso Supabase Auth que já possui Rate Limiting embutido)

👉 Chave = user_id / Valor = tokens restantes
→ TTL igual à janela de reabastecimento
→ Decremento atômico a cada requisição
→ Operação completa em menos de 1ms
📌 Rápido o suficiente pra não atrasar nada.

- **4️⃣ Você já usa isso e não sabia**

👉 OTP bloqueia após 5 tentativas por hora
👉 GitHub limita 5000 chamadas por hora por token
👉 App do banco trava após errar a senha várias vezes
👉 Instagram derruba bots de seguir/deixar de seguir
📌 Rate Limiting está em todo lugar.

⚠️ O erro clássico de dev júnior:

Implementar o rate limiting dentro do código da aplicação.
Sempre implemente no API Gateway — bloqueia antes de chegar no servidor.
Sem isso, um script num notebook derruba seu backend inteiro enquanto milhares de usuários reais sofrem.


### 18 - Usuário pediu para deletar a conta. Você deletou. Ele voltou no dia seguinte querendo recuperar tudo. E agora?

## Da forma mais simples 👇

- **1️⃣ Soft Delete**

👉 Você nunca deleta de verdade.
→ Adiciona um campo deleted_at no registro
→ Queries ignoram registros com esse campo preenchido
→ Pro usuário parece deletado. No banco ainda tá lá.
📌 Recuperar é só limpar o campo. Um segundo.

- **2️⃣ Período de carência**

👉 Deleta de verdade só depois de X dias.
→ Usuário pede exclusão → conta entra em modo desativado
→ Ficou 30 dias sem voltar → aí sim deleta definitivamente
→ Voltou antes? Reativa com tudo intacto
📌 É exatamente assim que Google, Instagram e Spotify fazem.

- **3️⃣ Exportação antes da exclusão**

👉 Antes de deletar, gera um backup dos dados do usuário.
→ Arquivo compactado com tudo que ele tinha
→ Fica guardado por um período mesmo após a exclusão
📌 LGPD agradece. Jurídico também.

- **4️⃣ Logs de auditoria**

👉 Registra tudo que aconteceu com aquela conta.
→ Quando pediu exclusão, quem executou, qual IP
→ Se vier processo, você tem o histórico completo
📌 Não é opcional em sistemas que lidam com dados pessoais.

⚠️ O erro clássico:
Executar DELETE no banco direto quando o usuário pede exclusão.
Simples de implementar. Impossível de desfazer.


### 19. Você precisa enviar notificação push para 50 milhões de usuários ao mesmo tempo, como você faz?

## Da forma mais simples 👇

50 milhões de notificações.
Ao mesmo tempo.
Em segundos.

- **1️⃣ Nunca envia direto do backend**

👉 Backend não fala com o dispositivo do usuário diretamente.
→ Android → passa pelo FCM (Firebase Cloud Messaging)
→ iOS → passa pelo APNs (Apple Push Notification Service)
→ Eles gerenciam a entrega, retry e confirmação
📌 Sua responsabilidade é chegar no FCM e APNs. O resto é deles.

- **2️⃣ Fila de mensagens**

👉 50 milhões de notificações não são disparadas de uma vez.
→ Backend publica os eventos numa fila
→ Workers consomem a fila e enviam em paralelo
→ Sistema não trava, não explode, processa no ritmo certo
📌 Kafka ou RabbitMQ resolvem isso com elegância.

- **3️⃣ Particionamento por segmento**

👉 Não precisa notificar todo mundo igual.
→ Divide os usuários em lotes por região, dispositivo ou perfil
→ Cada lote processado por um grupo de workers
→ Paralelismo real sem conflito entre processos
📌 50 milhões vira 500 lotes de 100 mil. Muito mais gerenciável.

- **4️⃣ Rate limiting no envio**

👉 FCM e APNs têm limite de requisições por segundo.
→ Enviar tudo de uma vez resulta em erro 429
→ Workers respeitam o limite de cada serviço
→ Backoff exponencial em caso de rejeição
📌 Velocidade controlada é melhor que velocidade máxima com falha.

- **5️⃣ Rastreamento de entrega**

👉 Notificação enviada não significa notificação entregue.
→ Usuário sem internet → FCM guarda e entrega quando voltar
→ Token expirado → remove do banco pra não desperdiçar recursos
→ Falhou após retries → vai pra dead letter queue pra análise
📌 Saber o que não foi entregue é tão importante quanto o que foi.

⚠️ O erro clássico:
Tentar enviar 50 milhões de notificações numa única chamada em loop.    
Um servidor em loop fecha em minutos. Fila distribui o trabalho por horas se precisar.


######      FIM      ######                                   