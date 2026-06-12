-- =========================================================================
-- 1. Atualiza a função is_admin() para aceitar também role = 'dev'
--    (dev é o cargo supremo, acima de admin)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'dev');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET row_security = off;

ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- =========================================================================
-- 2. Corrige RLS da tabela products para usar public.is_admin()
--    Antes usava subquery inline sem SET row_security = off,
--    causando recursão com o RLS da tabela users.
-- =========================================================================
DROP POLICY IF EXISTS "Admin controla produtos" ON public.products;

CREATE POLICY "Admin controla produtos" ON public.products
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Rodar esse código separadamente para adicionar produto por metro (m)
ALTER TABLE public.products
ADD COLUMN is_per_meter BOOLEAN NOT NULL DEFAULT false;
