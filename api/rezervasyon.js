// api/rezervasyon.js
// Vercel Serverless Function — Resend ile e-posta gönderimi

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ad, soyad, email, telefon, checkin, checkout, oda_tipi, kisi_sayisi, mesaj } = req.body;

  if (!ad || !email || !checkin || !checkout) {
    return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
  }

  const geceLik = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  const ciStr   = new Date(checkin).toLocaleDateString('tr-TR',  { day:'numeric', month:'long', year:'numeric' });
  const coStr   = new Date(checkout).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' });

  try {
    // Misafire onay e-postası
    await resend.emails.send({
      from: 'Tuna Butik Otel <rezervasyon@tunaotel.com>',
      to:   [email],
      subject: 'Rezervasyon Talebiniz Alındı — Tuna Butik Otel',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#0B4F7A,#0D6B5E);padding:28px 32px;border-radius:12px 12px 0 0">
            <div style="font-family:Georgia,serif;font-size:26px;font-weight:300;color:white">Tuna Butik Otel</div>
            <div style="font-size:10px;letter-spacing:0.2em;color:rgba(255,255,255,0.55);margin-top:4px">BODRUM · TÜRKİYE</div>
          </div>
          <div style="background:#fff;padding:28px 32px;border:1px solid #E8DECE;border-top:none">
            <p style="font-size:15px;color:#0D2233;margin:0 0 6px">Merhaba <strong>${ad}</strong>,</p>
            <p style="font-size:14px;color:#5A7A92;line-height:1.7;margin:0 0 22px">Rezervasyon talebinizi aldık. En kısa sürede <strong style="color:#25D366">WhatsApp</strong> üzerinden sizinle iletişime geçeceğiz.</p>
            <div style="background:#F5EFE6;border-radius:10px;padding:18px 20px;margin-bottom:22px">
              <div style="font-size:11px;letter-spacing:0.12em;color:#5A7A92;text-transform:uppercase;margin-bottom:12px">Talep Özeti</div>
              <table style="width:100%;border-collapse:collapse;font-size:13px">
                <tr><td style="color:#5A7A92;padding:4px 0">Giriş</td><td style="color:#0D2233;font-weight:500;text-align:right">${ciStr}</td></tr>
                <tr><td style="color:#5A7A92;padding:4px 0">Çıkış</td><td style="color:#0D2233;font-weight:500;text-align:right">${coStr}</td></tr>
                <tr><td style="color:#5A7A92;padding:4px 0">Konaklama</td><td style="color:#1DBFA8;font-weight:500;text-align:right">${geceLik} gece</td></tr>
                ${oda_tipi ? `<tr><td style="color:#5A7A92;padding:4px 0">Oda</td><td style="color:#0D2233;text-align:right">${oda_tipi}</td></tr>` : ''}
              </table>
            </div>
            <a href="https://api.whatsapp.com/send?phone=905326042607" style="display:inline-block;background:#25D366;color:white;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:500;text-decoration:none">WhatsApp ile Ulaşın</a>
          </div>
          <div style="background:#F5EFE6;padding:14px 32px;border-radius:0 0 12px 12px;font-size:11px;color:#5A7A92">
            Çarşı, Üçkuyular Cd. No:23, 48400 Bodrum/Muğla · <a href="https://tunaotel.com" style="color:#1DBFA8">tunaotel.com</a>
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'E-posta gönderilemedi' });
  }
}
