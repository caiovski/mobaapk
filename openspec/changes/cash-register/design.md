# Design — Abertura/Fechamento do Caixa

## 1. Arquitetura de dados

### Tabela `cash_register_entries`
```sql
CREATE TABLE public.cash_register_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,                    -- "CAIXA-20260610-001"
  date DATE NOT NULL,                           -- dia do movimento
  entry_type TEXT NOT NULL CHECK (entry_type IN ('opening', 'closing')),
  bill_100 INTEGER NOT NULL DEFAULT 0,
  bill_50 INTEGER NOT NULL DEFAULT 0,
  bill_20 INTEGER NOT NULL DEFAULT 0,
  bill_10 INTEGER NOT NULL DEFAULT 0,
  bill_5 INTEGER NOT NULL DEFAULT 0,
  bill_2 INTEGER NOT NULL DEFAULT 0,
  coin_100 INTEGER NOT NULL DEFAULT 0,         -- 1 real
  coin_050 INTEGER NOT NULL DEFAULT 0,         -- 0,50
  coin_025 INTEGER NOT NULL DEFAULT 0,         -- 0,25
  coin_010 INTEGER NOT NULL DEFAULT 0,         -- 0,10
  coin_005 INTEGER NOT NULL DEFAULT 0,         -- 0,05
  total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Índices
CREATE INDEX idx_cash_register_date ON public.cash_register_entries(date);
CREATE INDEX idx_cash_register_code ON public.cash_register_entries(code);

-- RLS
ALTER TABLE public.cash_register_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_cash_register" ON public.cash_register_entries
  FOR ALL USING (public.is_admin());
```

### Código único
Formato: `CAIXA-YYYYMMDD-NNN` onde NNN é o número do dia (reinicia por dia).
Gerado via: `SELECT COALESCE(MAX(SUBSTRING(code FROM '\\d{3}$')::int), 0) + 1 FROM cash_register_entries WHERE code LIKE 'CAIXA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%'`

## 2. Fluxo de navegação

```
Dashboard
  │
  ├─ [Abertura/Fechamento do caixa]
  │     │
  │     ▼
  │  CashRegisterScreen (Stack Navigator)
  │     │
  │     ├─ Se hoje e sem abertura → formulário de abertura (com steppers)
  │     ├─ Se hoje e com abertura → valores + botão "Fechar caixa" (17-20h)
  │     ├─ Se dia passado → valores + toggle "Ver abertura"/"Ver fechamento"
  │     │
  │     └─ "Ver registro" → CashRegisterHistoryScreen
  │           └─ Lista com code, date, "Ver" → volta para CashRegisterScreen com data filtrada
  │
  ├─ [Ver Vendas] (existente)
  └─ ...
```

## 3. Layout da tela principal

```
┌──────────────────────────────────────────┐
│  painel_caixa           [Filtro data]     │ ← AdminHeader + DateFilter
├──────────────────────────────────────────┤
│                                          │
│  ┌─ Cédulas ──────────────────────────┐  │
│  │ R$100   [-] 0 [+]         R$ 0,00  │  │
│  │ R$ 50   [-] 0 [+]         R$ 0,00  │  │
│  │ R$ 20   [-] 0 [+]         R$ 0,00  │  │
│  │ R$ 10   [-] 0 [+]         R$ 0,00  │  │
│  │ R$  5   [-] 0 [+]         R$ 0,00  │  │
│  │ R$  2   [-] 0 [+]         R$ 0,00  │  │
│  │ Total em cédulas:         R$ 0,00  │  │
│  └──────────────────────────────────────┘  │
│                                          │
│  ┌─ Moedas ──────────────────────────┐  │
│  │ R$ 1,00 [-] 0 [+]        R$ 0,00  │  │
│  │ R$ 0,50 [-] 0 [+]        R$ 0,00  │  │
│  │ R$ 0,25 [-] 0 [+]        R$ 0,00  │  │
│  │ R$ 0,10 [-] 0 [+]        R$ 0,00  │  │
│  │ R$ 0,05 [-] 0 [+]        R$ 0,00  │  │
│  │ Total em moedas:          R$ 0,00  │  │
│  └──────────────────────────────────────┘  │
│                                          │
│  ───────────────────────────────────────  │
│  Total global (abertura):     R$ 0,00   │
│  ───────────────────────────────────────  │
│                                          │
│  [Confirmar abertura]   [Cancelar]       │
│   (verde #339914)                         │
│                                          │
│  ── Após confirmar ──                    │
│  [Editar abertura] (verde água, 1x)     │
│  [Fechar caixa] (vermelho #A72424)      │ ← só se 17-20h
│                                          │
└──────────────────────────────────────────┘
```

## 4. Componentes

| Componente | Função |
|-----------|--------|
| `CashRegisterScreen` | Tela principal com steppers, totais, ações |
| `DenominationRow` | Linha única (ex: R$100 [-] 2 [+] → R$ 200,00) |
| `CashRegisterHistoryScreen` | Listagem histórica com filtro |
| `CashRegisterHistoryCard` | Card da listagem (código, data, "Ver") |
| `CashRegisterService` | CRUD contra Supabase |

## 5. Estados

| Estado | Steppers visíveis | Botões |
|--------|-------------------|--------|
| Sem registro hoje | Sim | Confirmar abertura |
| Abertura confirmada (edit não usado) | Não | Editar abertura (1x), Fechar caixa (se 17-20h) |
| Editando abertura | Sim | Confirmar |
| Abertura + fechamento confirmados | Não | Editar abertura (se não usado), Editar fechamento (se não usado) |
| Dia passado sem registro | Apenas leitura | — |
| Dia passado com registro | Não | Ver abertura / Ver fechamento (toggle) |

## 6. Cores dos botões

| Botão | Cor | Texto |
|-------|-----|-------|
| Confirmar abertura / Confirmar | `#339914` | Branco |
| Fechar caixa | `#A72424` | Branco |
| Editar (abertura ou fechamento) | `#2BE060` (verde água) | Branco |
| Ver abertura / Ver fechamento (toggle) | `#2D8CE5` (azul) | Branco |
| Cancelar | Outline cinza | Texto escuro |
