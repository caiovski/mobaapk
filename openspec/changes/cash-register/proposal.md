# Abertura/Fechamento do Caixa

## Resumo
Sistema para registrar abertura e fechamento do caixa físico no PDV, com controle de cédulas e moedas do real brasileiro, edição limitada (1x) e histórico consultável.

## Problema
O admin não tem um registro formal de quanto dinheiro físico estava no caixa no início e no final do dia. Atualmente só existem sangrias e suprimentos, sem um valor base de abertura nem conferência de fechamento.

## Solução
Criar uma tela com contadores de quantidade para cada denominação (6 cédulas + 5 moedas), calcular totais automaticamente, e persistir em tabela dedicada no Supabase com código legível único por dia.

## Escopo

### Inclui
- Botão "Abertura/Fechamento do caixa" no Dashboard (verde escuro, antes de "Ver Vendas")
- Modal/screen com steppers de quantidade por denominação
- Registro de abertura (qualquer horário)
- Registro de fechamento (somente 17:00–20:00)
- Edição única (após confirmar, botão "Editar" aparece)
- Histórico listável com filtro por data única
- Tabela `cash_register_entries` no Supabase

### Não inclui
- Cálculo automático do valor esperado no fechamento (abertura + vendas - sangrias + suprimentos)
- Suporte a múltiplos caixas físicos
- Moedas de R$0,01 (centavo)
- Relatórios ou exportação

## Critérios de aceite
1. Admin abre o registro, ajusta quantidades e confirma → dados salvos no Supabase
2. Após confirmar, steppers somem, aparece "Editar abertura" (verde água, 1 uso)
3. Entre 17:00–20:00 do mesmo dia, botão "Fechar caixa" (vermelho) fica disponível
4. Após fechar, steppers somem, aparece "Editar fechamento" (verde água, 1 uso)
5. Dias passados mostram "Ver abertura" / "Ver fechamento" (toggle)
6. "Ver registro" abre listagem histórica com código único e data
7. Código segue formato `CAIXA-YYYYMMDD-001`
