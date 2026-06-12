# Modo Deus e MFA Customizado (Admin Auth)

## O Problema
Atualmente, o app Admin (`agropet-admin`) exige que o proprietário faça login utilizando e-mail e senha. No entanto, por razões de extrema segurança e exclusividade do negócio, o painel deve ser restrito. O administrador deseja logar usando um Código de 8 Dígitos (enviado ao e-mail) mais a Senha.
Além disso, precisamos criar um nível de acesso "Modo Deus" (`dev`) para duas contas específicas, as quais terão privilégios absolutos sob todo o ecossistema (bypass de regras de negócio).

## A Solução (Roteador de Autenticação)
- **Fluxo do Dono (Admin)**: O usuário digita apenas o número de 8 dígitos no campo superior e sua senha no inferior. Se clicar em "Enviar código", uma Edge Function cria o código de 8 dígitos e envia por e-mail para a conta hardcoded do Nelson. O código será interceptado e traduzido de volta para o e-mail real antes de bater no Supabase.
- **Fluxo do Dev (Deus)**: O desenvolvedor digita seu próprio e-mail (que contém o `@`) e sua senha. O sistema percebe o `@`, ignora a regra dos 8 dígitos e loga diretamente.
- **Row Level Security (RLS)**: Atualizar as políticas do banco de dados para criar a hierarquia: `dev` > `admin` > `client`. A role `dev` tem permissão BYPASS.

## Escopo Técnico
- Supabase Edge Functions: Criar `generate-admin-code` para tratar o envio do OTP customizado.
- App Admin (`AdminLoginScreen.tsx`): Implementar a lógica de roteamento visual ("Tem @? É Dev. Só número? É Admin").
- Banco de Dados: Criar tabela temporária `admin_codes` para validar o código de 8 dígitos. Alterar RLS.
