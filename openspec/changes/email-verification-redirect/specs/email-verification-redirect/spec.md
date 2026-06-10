## ADDED Requirements

### Requirement: Aplicativo Registrado para Deep Links
O aplicativo Expo (agropet-cliente) MUST estar configurado no `app.json` para responder ao esquema `agropet://`.

#### Scenario: Sistema Operacional reconhece o link
- **DADO** que o aplicativo AgroPet está instalado no dispositivo
- **QUANDO** o usuário ou o navegador tentar abrir uma URL começando com `agropet://`
- **ENTÃO** o Sistema Operacional deve redirecionar a chamada e abrir o aplicativo móvel.

### Requirement: Supabase Redirects Configurados
O projeto no Supabase MUST ter as URLs baseadas em `agropet://` adicionadas na lista branca (Site URL ou Redirect URLs) para que os tokens gerados nos e-mails direcionem o tráfego de volta ao app.

#### Scenario: Geração de link no e-mail de confirmação
- **DADO** que um usuário solicita a criação de conta
- **QUANDO** o Supabase envia o e-mail
- **ENTÃO** o link de confirmação deve apontar para o redirecionamento configurado em vez de `localhost:3000`.

### Requirement: Captura e Autenticação de Sessão via URL Fragment
O aplicativo MUST implementar um listener global para URLs de Deep Link que seja capaz de extrair os parâmetros de autenticação (ex: `access_token` e `refresh_token`) contidos no fragmento `#` da URL e usá-los para estabelecer uma sessão do Supabase.

#### Scenario: Sucesso no Login via Deep Link
- **DADO** que o usuário clica no link de confirmação e é redirecionado para o app via `agropet://...#access_token=123...`
- **QUANDO** o app inicia e o listener captura a URL
- **ENTÃO** o aplicativo deve recuperar a sessão com `supabase.auth.getSession()` ou setar a sessão diretamente
- **E** o aplicativo deve navegar o usuário para a tela inicial (Home), ignorando a tela de Login.

#### Scenario: Falha de rede ao tentar obter sessão
- **DADO** que o app é aberto por um Deep Link
- **QUANDO** o app tenta validar a sessão extraída mas não há conexão com a internet
- **ENTÃO** o aplicativo deve exibir um toast ou alerta de "Falha de conexão"
- **E** deve manter o usuário na tela de Login até que a conexão seja restabelecida.

### Requirement: Tratamento de Fallback em Dispositivos sem App
Caso a estratégia de *Custom Scheme* seja bloqueada por clientes de e-mail agressivos, o projeto MUST ter a infraestrutura para usar uma página Web intermediária (hospedada) que faça o redirect programático em HTTPS.

#### Scenario: Fallback pela Página Intermediária
- **DADO** que o e-mail contém um link HTTPS (`https://agropet-lambari.vercel.app/confirm`)
- **QUANDO** o usuário clica no e-mail e abre no navegador
- **ENTÃO** a página Web deve redirecionar o navegador para `agropet://` usando Javascript (`window.location.href`).
