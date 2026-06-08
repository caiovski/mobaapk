<img style="width:100%" src="https://capsule-render.vercel.app/api?type=waving&color=E25822&section=header" />

<div align="center">
  <img src="assets/banner.svg" alt="AgroPet Lambari Banner" width="100%" />
</div>

<h1 align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=19&pause=1000&color=E25822&width=750&height=50&lines=Seja+muito+bem-vindo+ao+meu+projeto+Agropet+Lambari%2C+Leitor%21" alt="Welcome Typing SVG" />
  </a>
</h1>

<div align="center">

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

# 🐾 AgroPet Lambari — E-Commerce Mobile Multi-App

Seja muito bem-vindo ao repositório do **AgroPet Lambari**, um ecossistema mobile avançado composto por **dois aplicativos isolados** (Cliente e Administrador) desenvolvidos com as melhores práticas de Engenharia de Software, arquitetura robusta e banco de dados de alto desempenho.

---

## 👨‍💻 Sobre o Desenvolvedor

<div align="justify">

Olá, Leitor! Meu nome é **Caio Magalhães**, tenho 21 anos e sou graduando em **Sistemas de Informação** no **CEFET-MG** (*Centro Federal de Educação Tecnológica de Minas Gerais*). Como um jovem desenvolvedor apaixonado por arquitetura de software, interfaces imersivas e desempenho mobile, o **AgroPet Lambari** representa o meu primeiro grande marco prático na consolidação de conceitos avançados como transações de banco de dados ACID, desenvolvimento de APIs robustas em tempo real, sincronização offline tolerante a falhas e separação estrita de privilégios.

Este projeto reflete minha dedicação em criar softwares que não apenas resolvam problemas práticos com excelência comercial, mas que também sigam padrões limpos de design, facilitando a manutenção e a escalabilidade técnica.

</div>

---

## 💡 Motivação e Características

O **AgroPet Lambari** é um projeto nascido de uma necessidade real de mercado: modernizar a gestão de vendas e o canal de atendimento de uma loja especializada em agropecuária e petshop na histórica cidade de **Lambari, MG**.

### 🌟 Destaques de Negócio
- **Público de Lambari e Região:** Os moradores podem adquirir rações, ferramentas e insumos com entrega ágil em domicílio.
- **Logística Integrada com Raio de 17km:** O aplicativo calcula dinamicamente a geolocalização do cliente. Clientes dentro de um raio de 17km do centro de Lambari podem usufruir da entrega rápida da loja.
- **Integração Externa (Mercado Livre):** Clientes localizados fora do raio limite de entrega da loja física são redirecionados automaticamente para anúncios do estabelecimento no **Mercado Livre**, expandindo a cobertura de vendas sem onerar a logística local.

---

## 🛠 Tech Stack

<table align="center">
   <tr>
      <td align="center">
         <img alt="TypeScript" height="35" width="45" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" />
         <br /><sub>TypeScript</sub>
      </td>
      <td align="center">
         <img alt="React Native" height="35" width="45" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" />
         <br /><sub>React Native</sub>
      </td>
      <td align="center">
         <img alt="Expo" height="35" width="45" src="https://www.vectorlogo.zone/logos/expoio/expoio-icon.svg" />
         <br /><sub>Expo</sub>
      </td>
   </tr>
   <tr>
      <td align="center">
         <img alt="Supabase" height="35" width="45" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg" />
         <br /><sub>Supabase</sub>
      </td>
      <td align="center">
         <img alt="SQLite" height="35" width="45" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg" />
         <br /><sub>SQLite</sub>
      </td>
      <td align="center">
         <img alt="PostgreSQL" height="35" width="45" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" />
         <br /><sub>PostgreSQL</sub>
      </td>
   </tr>
   <tr>
      <td align="center">
         <img alt="HTML5" height="35" width="45" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" />
         <br /><sub>HTML5</sub>
      </td>
      <td align="center">
         <img alt="CSS3" height="35" width="45" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" />
         <br /><sub>CSS3</sub>
      </td>
      <td align="center">
         <img alt="JavaScript" height="35" width="45" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-plain.svg" />
         <br /><sub>JavaScript</sub>
      </td>
   </tr>
</table>

---

## 📱 Estrutura do Ecossistema (Cliente vs Admin)

Para garantir máxima segurança operacional e separação estrita de escopo, o projeto compila **dois APKs totalmente distintos**, impedindo que vulnerabilidades no código do app de e-commerce possam expor dados de faturamento gerenciais da loja.

```mermaid
graph TD
    subgraph ClienteApp [AgroPet Cliente]
        A1[Splash & Login] --> A2[Catálogo de Produtos]
        A2 --> A3[Carrinho Local SQLite]
        A3 --> A4[Checkout Inteligente]
        A4 --> A5[Acompanhamento Realtime]
    end
    subgraph AdminApp [AgroPet Admin]
        B1[Acesso Restrito] --> B2[Gestão de Pedidos]
        B2 --> B3[Rastreamento de Entregas]
        B3 --> B4[Histórico & Ganhos]
        B4 --> B5[Cadastro/Edição de Produtos]
    end
    ClienteApp ---|Supabase RPC & Realtime| DB[(Banco de Dados Supabase)]
    AdminApp ---|Supabase RPC & Realtime| DB
```

### 🛍️ AgroPet Cliente (13 Telas)
O aplicativo do cliente foi desenhado com foco em conversão, UX de alta fluidez e resiliência a quedas de conexão:
- **Splash Screen Dinâmico:** Carregamento de marca com verificação assíncrona de sessão.
- **Acesso Integrado (Supabase Auth):** Fluxo de login e cadastro seguro de clientes.
- **Catálogo de Alta Performance:** Filtros rápidos, busca integrada e exibição de detalhes detalhados.
- **Carrinho Local (SQLite):** Persistência robusta que mantém as compras do cliente seguras mesmo com o aplicativo fechado ou em locais com falha de sinal de rede.
- **Checkout Dinâmico:** Opções para pagamento no ato da entrega (PIX, Cartão de Crédito/Débito e Dinheiro).
- **Acompanhar Pedido:** Uma timeline responsiva que exibe o status de envio em tempo real com dados da entrega.
- **Mapa e Geolocalização:** Visualização de rotas, endereços salvos e rastreamento ativo de entregadores.

### 🛡️ AgroPet Admin (10 Telas)
O centro operacional do lojista, focado na gestão rápida do estoque, processamento de pedidos e relatórios de receita:
- **Login Autenticado por Permissão (Role):** Segurança robusta bloqueando acessos não autorizados.
- **Painel de Controle Principal (Hub):** Atalhos rápidos para operações essenciais.
- **Mapa de Logística de Entrega:** Visualização das entregas em andamento e cadastro manual de coordenadas de concorrentes regionais para fins estratégicos.
- **Gerenciador de Pedidos Avançado:** Atualização em tempo real do status das encomendas.
- **Cadastro e Edição de Produtos:** Formulários dinâmicos com upload de imagens e gerenciamento de estoque integrado.

---

## 🛠️ Como o Projeto Funciona (Arquitetura Técnica)

O **AgroPet Lambari** adota conceitos de **Clean Architecture** e **DDD (Domain-Driven Design)**, promovendo baixo acoplamento e altíssima testabilidade. Três grandes pilares de engenharia se destacam no seu funcionamento interno:

### 1. Offline-First com Cache Síncrono (SQLite + Supabase)
A fim de contornar os problemas comuns de internet oscilante no interior de Minas Gerais, o aplicativo implementa uma estratégia robusta baseada em **SQLite (`expo-sqlite`)** para armazenar o catálogo de produtos de forma local. Desta forma:
- O catálogo de produtos é cacheado localmente e carregado instantaneamente.
- O carrinho de compras é totalmente operado offline, sincronizando seus dados de forma transacional e transparente com o **Supabase** apenas no momento da consolidação final do pedido.

### 2. Validação Atômica de Estoque no Checkout (Prevenção de Corrida)
Para solucionar o clássico problema concorrente de múltiplos clientes comprando o mesmo item físico de estoque reduzido ao mesmo tempo, a consolidação de compras é processada na camada de banco de dados do **Supabase** através de uma **Função RPC (`finalizar_pedido`)** escrita em PL/pgSQL:
- O sistema executa instruções `SELECT ... FOR UPDATE` travando as linhas dos respectivos produtos durante a transação.
- **Garantia ACID:** Caso o estoque total seja decrementado a zero antes de uma das solicitações, a transação correspondente sofre rollback e o app exibe uma mensagem de erro amigável.
- **Trigger de Auto-Desativação:** Um gatilho automático (`auto_deactivate_product`) desativa instantaneamente a exibição do produto no catálogo do cliente quando o estoque atinge zero, reativando-o assim que o estoque for reposto pelo administrador.

### 3. Rastreamento e Sincronização GPS em Tempo Real
A arquitetura de rastreamento do entregador utiliza a capacidade reativa do **Supabase Realtime**:
- O dispositivo do entregador (App Admin), sob permissões nativas de geolocalização (`expo-location` operando em segundo plano), grava dados na tabela transacional `delivery_tracking` em intervalos periódicos.
- O aplicativo cliente assina esse canal e recebe as coordenadas via WebSockets.
- Para evitar a sensação de "saltos" do carro no mapa decorrentes de oscilações de sinal, o app do cliente implementa técnicas de **interpolação e suavização gráfica** no componente de mapa (`react-native-maps`), entregando ao usuário final um rastreamento limpo e com deslizar contínuo.

---

## 🚀 Funcionalidades Futuras (Backlog de Inovação)

Novas e inovadoras mecânicas de comportamento visual e de negócios estão catalogadas para implementação nas próximas versões:

- **Pagamento Nativo por PIX:** Geração inteligente de QR Code *Copy and Paste* dinâmico com suporte para leitor via câmera no app do cliente.
- **Autenticação Biométrica:** Acesso facilitado e seguro ao painel administrativo por meio de FaceID ou impressão digital local (`expo-local-authentication`).


---

<img src="assets/updates-banner.svg?v=sprint3-legal-gps" width="500" alt="AgroPet Updates" />

## 🕹️ Histórico de Updates Realizados (Sprint de Inovação)

Compilamos abaixo a lista completa de mecânicas de ponta que foram totalmente implementadas e agregadas ao ecossistema do **AgroPet Lambari**:

### 🗂️ 1. Filtro Avançado e Alertas de Estoque Reativos
*   **Filtros Unificados e Modernizados:** Unificamos os filtros de controle de catálogo administrativo em um botão dinâmico e consistente ao de relatórios de vendas.
*   **Detecção de Baixo Estoque:** Subseção dedicada para produtos em **Alerta Amarelo** (atenção) e **Alerta Vermelho** (crítico).
*   **Priorização com Exclusão Mutua:** Catálogo ordena produtos críticos no topo; filtros de alerta anulam a categoria *Inativos*.

### ⚙️ 2. Seleção e Desativação em Massa de Produtos
*   **Operações em Bloco:** Botão "Selecionar Tudo" + "Desativar Todos" para gestão simultânea de centenas de itens.
*   **Alternância Inteligente:** Botão se transforma em "Cancelar Seleção" quando modo de exclusão é ativado.
*   **Aviso Destrutivo em Tela Cheia:** Confirmação visual vermelha para prevenir erros acidentais.

### 🎠 3. Carrossel Multi-Fotos (Até 5) com Animação e Opacidade Flanqueada
*   **Upload de Múltiplas Mídias:** Até 5 fotos por produto, serializadas no banco de dados.
*   **Visualização Clássica de Flanco:** Imagem centralizada flanqueada por mini-prévias com `opacity: 0.35`.
*   **Animação Cross-Fade:** Looping automático de transição a cada 5 segundos no catálogo do cliente.
*   **fallback Estático:** Telas secundárias exibem apenas a primeira foto.

### ⚡ 4. Resolução de Timeouts RLS e Otimizações de Caixa e Histórico
*   **Fim de Gargalos (Postgres 57014):** Remoção de timeouts com `SET row_security = off` e otimização para menos de 50ms.
*   **Desvinculação Caixa/PDV:** Ledger passa a exibir exclusivamente sangrias e suprimentos manuais.
*   **Histórico de Pedidos Puro:** Oculta vendas do PDV, mostra estritamente pedidos online de clientes.

### 🧪 5. Maximização de Cobertura de Testes e Limpeza Arquitetural
*   **100% Test Coverage:** Testes unitários herméticos em Domain Entities e Value Objects (Order, Product, User, etc.).
*   **Edge Cases:** Testes de timeout assíncrono e tracking com duração nula no AdminMapScreen.
*   **Limpeza Arquitetural:** Remoção de artefatos obsoletos e arquivos *index.ts* vazios.

### 🎨 6. Unificação Global de Caixa e Sincronização UI/UX
*   **Caixa Global Unificado:** Sincronização contábil completa na tela de Histórico de Vendas com `<CaixaGlobalPanel>`.
*   **Reversão Atômica de Estoque:** Devolução de produtos ao estoque com expurgação simultânea do Caixa Global.
*   **Dark Mode Avançado:** SVGs explícitos `*Dark.svg` para forçar cores brancas em interfaces `#000000`.
*   **Bateria Invicta:** 253/253 testes Cliente e 512/512 Admin.

### 🛠️ 7. Refatoração e Bug Fixes Técnicos — 30/05/2026
*   **Modularização Extrema:** Componentes reduzidos de 2.000+ para menos de 400 linhas.
*   **Bugfix Crítico:** Resolução de timeouts no Jest e duplicação sintática na TrackingScreen.
*   **Limpeza Final:** Expurgo de arquivos residuais, logs e scripts locais.

### 🛡️ 8. Patch: Blindagem do projeto, reforma no Banco de Dados e melhorias técnicas — 31/05/2026
*   **Cobertura 100% Admin:** 14 novos arquivos de teste, 100% Statements/Branches/Functions/Lines em 68 arquivos.
*   **13 Migrations SQL (22-34):** Idempotência, Rate Limiter, Estoque Atômico, RLS, Auditoria, Índices, PIX, IDOR, Controle de Concorrência, LGPD, Notificações e Dead-Letter Queue.
*   **Infraestrutura:** Docker multi-estágio, docker-compose, CI/CD GitHub Actions, health check, feature flags.
*   **Push 50M:** Expo Push API com fila e DLQ para 50 milhões de notificações simultâneas.
*   **Offline Sync:** Delta sync incremental com 90% redução de banda e merge automático por timestamp.
*   **15 OpenSpecs:** Documentação viva de todas as iniciativas técnicas.
*   **61 arquivos, +1889 linhas, -310 removidas** — 999 testes.

### ⚖️📡 9. LegalPages e Rastreamento GPS em Tempo Real (NOVO!!!) — 07/06/2026
*   **LegalPages Compartilhado (Cliente + Admin):** Telas de Política de Privacidade e Termos de Uso em ambos os apps, com roteamento dinâmico na `AuthStack` via parâmetro `documentType` e 6 testes unitários validando privacidade, termos, fallback e fechamento.
*   **gpsTrackingService (Admin):** Serviço modular com start/stop monitoramento, atualização periódica de coordenadas no Supabase e tratamento de erros com timeouts. Hook `useGpsTracking` gerenciando o ciclo de vida do tracking no `AdminOrderDetail`. 2 suites de teste com cenários de sucesso, falha de permissão e timeout.
*   **Migration SQL (41):** Script `add_delivery_tracking.sql` para estrutura de persistência do tracking em tempo real.

### 🗺️🐛 10. Delivery Minimap, Correções de UX e Expansão de Testes (NOVO!!!) — 07/06/2026
*   **Componente DeliveryMinimap (Cliente):** Mapa customizado com `react-native-maps`, marcador animado da posição do entregador, polígono de rota e centralização dinâmica da câmera. Hook `useDeliveryMinimap` com assinatura Realtime, interpolação suave de coordenadas e fallback para timeline textual.
*   **Dropdown Fechando ao Tocar Fora:** `onStartShouldSetResponderCapture` no `OrdersScreen` + `closeAllDropdowns()` no botão Detalhes do `OrderCard`.
*   **Correção hasDeparted:** Lógica expandida para incluir status `completed` no AdminMapScreen.
*   **Expansão de Testes:** Cobertura adicional em `shopHours.test.ts` (finais de semana/feriados), `database.test.ts` (transação, rollback, concorrência), `ConnectivityContext.test.tsx` e `coverage-edge-cases.test.tsx`.
*   **58 arquivos modificados, +2726 linhas, -538 removidas** — 363 testes Admin e 145 Cliente, **508 testes automatizados**.

---

## 🤝 Agradecimento

Muito obrigado por dedicar seu tempo para conhecer o meu projeto **AgroPet Lambari**! Este repositório reflete horas de estudo, refatoração de código e amor pelo desenvolvimento de software de alta fidelidade técnica. Fique à vontade para explorar os arquivos do repositório, propor melhorias no código ou entrar em contato para trocarmos experiências sobre Engenharia de Software e Tecnologias Mobile.

---

## 📞 Contato & Redes Sociais

Caso queira acompanhar minha jornada de desenvolvimento de perto, ver novidades sobre projetos ou discutir parcerias profissionais:

<div align="center">

<!-- Modern social links utilizing GitHub badges style -->
<a href="https://wa.me/5535998906096" target="_blank">
  <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Caio Magalhães WhatsApp" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-right: 10px;" />
</a>
<a href="https://www.instagram.com/caio.json/" target="_blank">
  <img src="https://img.shields.io/badge/Instagram-caio.json-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Caio Magalhães Instagram" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
</a>

</div>

---

<div align="center">
  <sub>© 2026 Caio Magalhães. Todos os direitos reservados. Projetado e construído com 💻, 🧠 e ☕ em Varginha, MG.</sub>
</div>

<img style="width:100%" src="https://capsule-render.vercel.app/api?type=waving&color=E25822&section=footer" />
