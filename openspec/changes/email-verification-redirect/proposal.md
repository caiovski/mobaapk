## Why

Atualmente, o link de confirmação de e-mail enviado pelo Supabase redireciona os usuários para `http://localhost:3000` após a validação no servidor. Como o aplicativo (AgroPet Lambari) já está em produção, novos clientes que tentam se cadastrar não conseguem concluir o login porque seus dispositivos móveis falham ao tentar abrir essa URL local. Precisamos corrigir esse fluxo para garantir a retenção de usuários e a criação bem-sucedida de contas, redirecionando o cliente de volta para o aplicativo ou para uma página de sucesso.

## What Changes

- Configurar um Deep Link no aplicativo mobile (Expo) utilizando o formato `agropet://` ou configurar uma página Web intermediária na nuvem (Vercel/Netlify) para receber o tráfego do e-mail.
- Atualizar a configuração de **Site URL** no painel do Supabase (Authentication > URL Configuration) para a nova URL de redirecionamento.
- Ajustar o código do `agropet-cliente` para capturar a abertura do app via Deep Link e tratar o estado de sessão de autenticação (redirecionar para a Home ou para uma tela de sucesso).

## Capabilities

### New Capabilities
- `email-verification-redirect`: Fluxo completo de confirmação de e-mail e redirecionamento, capturando o evento de autenticação e guiando o usuário logado de volta ao aplicativo (via Deep Link nativo ou web fallback).

### Modified Capabilities
Nenhuma.

## Impact

- **Supabase:** Mudança na configuração do provedor de e-mail e Site URLs.
- **agropet-cliente (Expo/React Native):** Adição de captura de deep links (`expo-linking`) na raiz do app para roteamento.
- **Experiência do Usuário (UX):** Fluxo de cadastro fluido, permitindo logar automaticamente após confirmação.
