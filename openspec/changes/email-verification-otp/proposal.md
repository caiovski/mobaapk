# Mudança para Confirmação de E-mail via Código (OTP)

## O Problema
Atualmente, o Supabase envia um e-mail de confirmação de cadastro contendo um link (`localhost:3000`). Como o aplicativo não é um site web, o cliente não consegue concluir o cadastro se clicar no link pelo celular, resultando em abandono de funil.
Uma solução baseada em Deep Links exigiria a criação e hospedagem de um mini-site (ponte) e aumentaria a complexidade arquitetural do app.

## A Solução
Substituir a verificação baseada em Links por **Verificação baseada em Códigos de 6 Dígitos (OTP)**.
O Supabase possui suporte nativo para OTP em cadastros (`verifyOtp`). Ao configurar o template de e-mail do Supabase para enviar a variável `{{ .Token }}`, o cliente receberá apenas um número simples. No aplicativo, criaremos uma tela (ou um modal na tela de Login/Cadastro) para que o usuário insira esse código e confirme a conta, mantendo toda a experiência nativa e dentro do app.

## Escopo
- Alteração no Painel do Supabase (Templates de E-mail).
- Criação de componente/tela para inserção de código de 6 dígitos no `agropet-cliente`.
- Integração da API `supabase.auth.verifyOtp()` no fluxo de AuthContext.
