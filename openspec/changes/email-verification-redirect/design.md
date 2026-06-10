## Context

O aplicativo AgroPet Lambari está em produção (estritamente em Expo e React Native), utilizando o Supabase para Autenticação. Atualmente, o fluxo de criação de conta envia um e-mail com um link de confirmação que, após ser validado pelo servidor do Supabase, tenta redirecionar o usuário para `http://localhost:3000`. Isso falha nos dispositivos dos usuários em produção, quebrando o fluxo de cadastro e gerando perda de conversão.

## Goals / Non-Goals

**Goals:**
- Configurar o "Site URL" e os "Redirect URLs" do Supabase para apontar corretamente para a produção.
- Configurar *Deep Linking* (`agropet://`) no projeto Expo.
- Capturar o evento de redirecionamento no aplicativo móvel usando `expo-linking` e autenticar o usuário de forma transparente.
- (Opcional, mas recomendado) Criar uma página intermediária web simples (Vercel/Netlify) para receber o clique do e-mail via HTTPS e redirecionar para o app móvel, driblando restrições de clientes de e-mail (como Gmail) em relação a links com *Custom Schemes*.

**Non-Goals:**
- Alterar o layout do e-mail enviado pelo Supabase.
- Modificar tabelas de banco de dados (`public.users`) ou Políticas RLS.
- Implementar login social (Google, Apple).

## Decisions

1. **Configuração de Módulos Expo**:
   - Adicionaremos a propriedade `"scheme": "agropet"` no `app.json` (seção `expo`).
   - Nenhuma permissão extra de hardware será necessária para esta etapa.
   
2. **Arquitetura do Fluxo de Roteamento (UI/UX)**:
   - A raiz do app (ex: `App.tsx` ou controlador de rotas) implementará um listener utilizando `expo-linking` (`Linking.addEventListener('url', handleDeepLink)`).
   - Quando a URL `agropet://` for detectada, o código extrairá o fragmento de autenticação (`#access_token=...`) se houver e chamará `supabase.auth.getSession()` / `supabase.auth.onAuthStateChange()`.
   - Se a sessão for válida e confirmada, o fluxo de navegação React Navigation direcionará o usuário automaticamente para a Home (`(tabs)` ou equivalente), pulando a tela de Login.

3. **Estratégia de Sincronização (Supabase)**:
   - O Supabase Auth cuidará da criação e validação via servidor. Nenhuma sincronização de SQLite é necessária nesta etapa de verificação. Apenas salvaremos tokens nativamente usando o `expo-secure-store` (já incluído no projeto).

## Risks / Trade-offs

- **Risco**: Clientes de e-mail (Gmail, Outlook) costumam remover ou desabilitar links de e-mail que usam protocolos não-padrão (como `agropet://`), forçando apenas `http/https`.
- **Mitigação**: O "Site URL" no Supabase deve apontar para uma Landing Page em `https` (ex: `https://agropet-lambari.vercel.app/auth/confirm`). Esta página conterá um botão ou um script simples em JS que executará `window.location.href = "agropet://...";`, garantindo a abertura do app em ambos OS (iOS/Android).

- **Risco**: Usuários sem o aplicativo instalado clicando no link de confirmação.
- **Mitigação**: A página Web intermediária mencionada acima deve ter um *fallback* inteligente: se o *Deep Link* falhar ou demorar, exibir os botões "Baixar na App Store" e "Baixar no Google Play".
