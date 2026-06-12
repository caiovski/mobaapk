# Design de Arquitetura: Checkout e Faturamento

## 1. Gateway de Pagamento (PIX)
Para geração dinâmica do PIX com liquidação instantânea sem burocracia, o provedor escolhido pode ser o **Mercado Pago** ou **Asaas** (excelentes APIs para PIX).
- **Fluxo:** 
  1. Cliente aperta "Finalizar Compra".
  2. O app chama uma Edge Function (`create-pix-order`).
  3. A Edge Function bate no Gateway, gera o QR Code e o Payload (Copia e Cola).
  4. Retorna para o app exibir na tela.
  5. Uma segunda Edge Function (`pix-webhook`) fica aguardando o Gateway avisar: "Pagou!". Quando avisa, ela atualiza o `status` do pedido no banco para `pago`.
  6. O Supabase Realtime avisa o app cliente automaticamente que o pagamento caiu, e a tela avança para "Sucesso".

## 2. Emissão de NF-e
Recomenda-se utilizar uma API dedicada para emissão fiscal como **Focus NFe** ou o próprio ERP atual caso tenha API.
- A emissão não ocorre no app cliente. A Edge Function `pix-webhook` que acabou de confirmar o pagamento pode enfileirar uma chamada para a API de NFe.
- A API retorna a URL do PDF (DANFE) e o XML. Estes links são salvos na tabela de pedidos do Supabase (colunas: `nfe_danfe_url`, `nfe_xml_url`).

## 3. Impressão de Documentos (PDF) no Admin
No aplicativo Admin, quando o Nelson ou funcionário abrir um pedido, usaremos duas bibliotecas Expo:
- `expo-print`: Para desenhar em HTML um recibo simples (itens do pedido, total, nome do cliente) e convertê-lo para PDF na hora.
- `expo-sharing`: Para pegar o PDF gerado pelo `expo-print` (ou a URL da NF-e salva no banco) e abrir a tela nativa do celular de compartilhamento/impressão (onde ele pode mandar direto para uma impressora térmica Bluetooth ou Wi-Fi conectada ao celular).
