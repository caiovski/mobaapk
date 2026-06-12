## Fase 1: Supabase & Webhooks
- [ ] Criar as colunas necessárias na tabela de pedidos (`pix_qr_code`, `pix_payload`, `nfe_danfe_url`, `payment_status`).
- [ ] Escrever Edge Function `create-pix-order` para falar com o Gateway.
- [ ] Escrever Edge Function `pix-webhook` para escutar notificações do Gateway e mudar o status do pedido no banco.
- [ ] Adicionar lógica na Edge Function para enviar dados do cliente e produtos para API de NFe.

## Fase 2: App Cliente (agropet-cliente)
- [ ] Na tela de finalização de compra, criar componente que chama a Edge Function de PIX.
- [ ] Renderizar o QR Code na tela e exibir botão "Copiar Chave".
- [ ] Implementar listener (Supabase Realtime) na tela para aguardar o `payment_status` virar `pago`.
- [ ] Redirecionar para tela de sucesso.

## Fase 3: App Admin (agropet-admin) & PDF
- [ ] Instalar as bibliotecas: `npx expo install expo-print expo-sharing`.
- [ ] Na Tela de Detalhes do Pedido, adicionar botão "Emitir Recibo em PDF".
- [ ] Criar template em HTML (com nome da loja AgroPet, endereço, lista de produtos e subtotal) e usar `expo-print` para desenhar o PDF.
- [ ] Vincular o botão de "Imprimir NFe" caso a coluna `nfe_danfe_url` já esteja populada pelo webhook.
