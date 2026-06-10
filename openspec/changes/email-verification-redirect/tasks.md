## 1. Configuração (App e Web)

- [ ] 1.1 Configurar `"scheme": "agropet"` no `app.json` para habilitar Deep Linking nativo.
- [ ] 1.2 Criar um repositório web simples ou adicionar uma rota no backend existente para servir uma página HTML estática que fará o redirect HTTPS -> `agropet://`.

## 2. Configuração do Supabase (Autenticação)

- [ ] 2.1 Atualizar o **Site URL** no Supabase Dashboard para a URL HTTPS intermediária (ex: `https://agropet-lambari.vercel.app`).
- [ ] 2.2 Adicionar `agropet://*` nos **Redirect URLs** (lista branca) do Supabase.

## 3. Implementação do Roteamento (App Expo)

- [ ] 3.1 Escrever teste unitário para o hook/listener de Deep Linking garantindo que fragmentos da URL são extraídos.
- [ ] 3.2 Instalar/Verificar o pacote `expo-linking` e implementar o listener global na montagem do `App.tsx` (ou _layout.tsx).
- [ ] 3.3 Adicionar lógica para chamar `supabase.auth.getSession()` extraindo tokens do fragmento da URL.
- [ ] 3.4 Implementar tratamento de erro na recuperação de sessão (ex: exibir toast de falha de rede ou link expirado).
- [ ] 3.5 Disparar a navegação condicional: redirecionar para a `Home` se a sessão for confirmada, ou manter em `Login` em caso de falha.
