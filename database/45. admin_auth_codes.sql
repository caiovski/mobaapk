-- Migration 44: Admin Auth Codes and Dev Bypass
-- Adiciona a tabela para os códigos de 8 dígitos do Admin e a Role de Dev.

-- 1. Criação da tabela temporária de códigos
CREATE TABLE IF NOT EXISTS public.admin_auth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false
);

-- Habilitar RLS na tabela para segurança
ALTER TABLE public.admin_auth_codes ENABLE ROW LEVEL SECURITY;

-- Somente o service_role (Edge Functions) pode inserir e selecionar
-- Portanto, o cliente não consegue ler a tabela diretamente.

-- 2. Atualização das Policies para o "Modo Deus"
-- Vamos adicionar uma política genérica que permite acesso total se a role for 'dev'
-- Aviso: Você deve rodar isso no SQL Editor do Supabase.

-- Garantir que a enumeração possua o valor 'dev'
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'dev';

-- Garantir que os devs estejam no banco com a role 'dev'
UPDATE public.users 
SET role = 'dev' 
WHERE email IN ('caiozera@protonmail.com', 'caiomfonsecaarantes07@gmail.com');

-- Garantir que o dono esteja como 'admin'
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'nelsonarantes2007@gmail.com';

-- Nota: Como o Supabase não suporta "Superuser" bypass em RLS facilmente sem definir policies,
-- a melhor abordagem é assegurar que todas as tabelas cruciais tenham:
-- CREATE POLICY "Dev has full access" ON public.sua_tabela USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'dev');
-- (Recomendamos adicionar essa linha em tabelas que o Dev precisa burlar bloqueios de admin/client).

-- Rodar esse código separadamente no final de tudo (bug no banco de dados)
ALTER TABLE public.products
  ADD COLUMN critical_stock INTEGER,
  ADD COLUMN moderate_stock INTEGER;
