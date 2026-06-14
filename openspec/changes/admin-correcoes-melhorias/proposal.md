# Correções e Melhorias — Admin

## Resumo
Conjunto de 7 correções e melhorias no app admin do agropet, cobrindo desde bugs críticos (estoque Kg/g, sangria em tempo real) até implementações de UX (botão X na pesquisa, edição de filtros, toggle de quantidade no PDV) e reforma da tela de caixa.

## Problema
O app admin apresenta bugs que afetam a operação diária da loja: produtos com estoque 0 ficam ativos, estoque em Kg/g é tratado como unidades inteiras, sangria não sincroniza entre dispositivos, e a tela de abertura/fechamento do caixa está quebrada (não registra fechamento, botões "Ver" não funcionam). Além disso, faltam funcionalidades de UX que facilitam o uso diário.

## Solução
Implementar 7 mudanças no código fonte do app admin (sem tocar em config):

1. **Auto-desativar produto estoque 0** — Ao criar ou atualizar produto para estoque 0, desativar automaticamente. Ao colocar estoque > 0, reativar. Em tempo real via subscription Supabase + `DeactivateLowStockProductsUseCase`.

2. **Botão X nas barras de pesquisa** — Adicionar ícone de limpar (X) em todas as barras de pesquisa do admin e cliente, visível apenas enquanto o campo não está vazio. Ao clicar, limpa o campo.

3. **Tela de editar filtros (categoria/keywords)** — Tela separada com cards em 2 colunas (nome da categoria | keywords). Keywords quebram linha, recolhem com seta ▼. Ícone de editar. Botão "Gerenciar categorias" no filtro. Ativar/desativar/excluir.

4. **Toggle quantidade digitável no PDV** — Interruptor na tela Registrar Venda: ON → campo de texto para digitar quantidade, OFF → botões -/+.

5. **Correção estoque Kg/g** — Produtos com unidade Kg/g passam a ter dois seletores (Kg / g). Kg desconta quilos, g desconta gramas. Corrige o cálculo de estoque.

6. **Sangria e Suprimento em tempo real** — Sangria e suprimento atualmente salvos em SecureStore local. Migrar ambos para Supabase com subscription real-time para que todos os admins vejam simultaneamente.

7. **Reforma da tela de Caixa** — Novos horários (abertura 07:30-11:30, fechamento 16:00 útil / 23:59 feriado/sábado).
8. **Refresh na tela Gerenciar Produtos** — Adicionar pull-to-refresh (igual ao existente em Consultar Vendas) na tela de gerenciar produtos. Botão "Editar abertura" (verde água, 1 uso). Layout: Confirmar abertura | Fechar Caixa | Cancelar. "Comparar" no registro. Corrigir "Ver" quebrado.

## Escopo

### Inclui
- Código fonte .ts/.tsx do admin e cliente (agropet-admin/ e agropet-cliente/)
- Apenas alterações em JS/TS — sem config, sem módulos nativos novos

### Não inclui
- Alterações em app.json, app.config.js, eas.json, package.json
- Migrações SQL (se precisar de nova tabela, usar migration existente ou Supabase client)
- Testes automatizados (serão feitos em momento posterior)
- Rebuild nativo (EAS Update OTA)

## Critérios de aceite
1. Produto com estoque 0 aparece como inativo no grid; ao receber estoque > 0, reativa
2. Toda barra de pesquisa tem botão X que aparece durante digitação e limpa o campo
3. Admin consegue editar nome/keywords de categorias em tela dedicada
4. Toggle no PDV alterna entre +/- e campo digitável
5. Produto Kg/g: admin escolhe Kg ou g, desconto correto no estoque
6. Sangria aparece em tempo real em todos os dispositivos admin logados
7. Caixa: abertura 07:30-11:30, fechamento 16:00 (útil) / 23:59 (feriado/sábado), botão editar (1x), comparar funcional, "Ver" funcionando
