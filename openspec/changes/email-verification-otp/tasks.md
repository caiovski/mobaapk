## 1. Configuração (Painel do Supabase)

- [ ] 1.1 Acessar o Dashboard do Supabase -> Authentication -> Email Templates.
- [ ] 1.2 Editar o template de "Confirm Signup" apagando a url padrão e inserindo um texto amigável junto com a variável `{{ .Token }}`.

## 2. Interface de Usuário (App Expo)

- [ ] 2.1 Criar o componente `OTPVerificationScreen` (ou Modal) em `src/presentation/screens/Auth`.
- [ ] 2.2 Este componente deve ter um campo de input numérico de 6 posições, e um botão "Confirmar".
- [ ] 2.3 Atualizar a Navegação (`AppNavigator.tsx`) para permitir navegação do `SignupScreen` para o `OTPVerificationScreen`.

## 3. Lógica de Autenticação

- [ ] 3.1 Em `AuthContext.tsx` ou no próprio componente de OTP, adicionar o método que chama `supabase.auth.verifyOtp({ email, token, type: 'signup' })`.
- [ ] 3.2 Implementar tratamento de erros caso o código seja inválido ou expirado.
- [ ] 3.3 Após o sucesso do `verifyOtp`, garantir que o usuário seja redirecionado para a `Home` e o estado da sessão seja atualizado.
