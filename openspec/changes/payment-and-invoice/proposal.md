# Checkout e Faturamento: PIX, NF-e e PDF

## O Problema
Atualmente o aplicativo não possui um gateway de pagamento totalmente automatizado, não emite notas fiscais (NF-e) de forma sistêmica e os administradores não têm uma forma nativa de imprimir recibos e documentos dos pedidos para separação e entrega.

## A Solução
Implementar um fluxo completo de **Checkout e Faturamento**:
1. **Integração PIX (Gateway):** Gerar um PIX dinâmico (QR Code e Copia e Cola) na finalização do pedido. O app cliente fica aguardando o webhook (ou polling) confirmar o pagamento para prosseguir.
2. **Emissão de NF-e:** Após a confirmação do pagamento, uma Edge Function no Supabase dispara os dados da compra para uma API de Notas Fiscais (ex: Focus NFe, Bling ou emissor do gateway).
3. **Geração e Impressão de PDF:** No painel do Admin (`agropet-admin`), adicionar botões para gerar o PDF do recibo do pedido (usando `expo-print`) e visualizar/imprimir a NF-e.

## Escopo
- Alterações no Supabase: Tabelas de Pedidos (campos `pix_txid`, `nfe_url`, `payment_status`), Edge Functions para Webhook PIX e emissão de NF.
- App Cliente: Tela de pagamento com QRCode do PIX e escuta ativa de pagamento.
- App Admin: Botões na tela de Detalhes do Pedido para "Imprimir Recibo" e "Emitir/Ver Nota Fiscal".
