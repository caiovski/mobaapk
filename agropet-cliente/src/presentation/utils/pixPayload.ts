function crc16CCITT(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i);
    if (charCode > 255) continue;
    crc ^= charCode << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function emvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return id + len + value;
}

export function generatePixPayload(params: {
  pixKey: string;
  merchantName: string;
  amount: number;
  txid: string;
  city?: string;
}): string {
  const merchantName = params.merchantName.trim();
  const city = (params.city || 'CIDADE').trim();
  const amount = params.amount.toFixed(2);
  const txid = params.txid.slice(0, 25);

  const merchantAccountInfo =
    emvField('00', 'br.gov.bcb.pix') +
    emvField('01', params.pixKey);

  const additionalData =
    emvField('05', txid);

  let payload =
    emvField('00', '01') +
    emvField('26', merchantAccountInfo) +
    emvField('52', '0000') +
    emvField('53', '986') +
    emvField('54', amount) +
    emvField('58', 'BR') +
    emvField('59', merchantName) +
    emvField('60', city) +
    emvField('62', additionalData);

  const crc = crc16CCITT(payload + '6304');
  return payload + '6304' + crc;
}
