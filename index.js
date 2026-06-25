require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.json({ message: '服务器正常运行' });
});

app.get('/api/products', async (req, res) => {
  const { category } = req.query;
  let query = supabase.from('products').select('*').order('created_at', { ascending: true });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/products/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/quotes', async (req, res) => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/api/quotes/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get('/api/content', async (req, res) => {
  const { data, error } = await supabase.from('content').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const content = {};
  data.forEach(item => { content[item.key] = item.value; });
  res.json(content);
});

app.patch('/api/content', async (req, res) => {
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)) {
    await supabase.from('content').update({ value, updated_at: new Date() }).eq('key', key);
  }
  res.json({ success: true });
});

app.post('/api/quote', async (req, res) => {
  const { name, email, phone, zipCode, productType, projectType } = req.body;
  try {
    await supabase.from('quotes').insert([{
      name, email, phone,
      zip_code: zipCode,
      product_type: productType,
      project_type: projectType
    }]);

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background-color:#b91c1c;padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;">🏠 我的窗户公司</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;">WINDOWS & DOORS</p>
</td></tr>
<tr><td style="padding:40px 40px 24px;border-bottom:1px solid #f0f0f0;">
<p style="margin:0 0 8px;color:#b91c1c;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">新报价申请</p>
<h2 style="margin:0;color:#111827;font-size:28px;font-weight:900;">您收到了一条新的报价申请！</h2>
<p style="margin:12px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">以下是客户的详细信息，请尽快联系跟进。</p>
</td></tr>
<tr><td style="padding:32px 40px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
<table width="100%"><tr>
<td width="40%" style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">姓名</td>
<td width="60%" style="color:#111827;font-size:15px;font-weight:700;">${name}</td>
</tr></table></td></tr>
<tr><td style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
<table width="100%"><tr>
<td width="40%" style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">邮箱</td>
<td width="60%"><a href="mailto:${email}" style="color:#b91c1c;font-size:15px;font-weight:700;text-decoration:none;">${email}</a></td>
</tr></table></td></tr>
<tr><td style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
<table width="100%"><tr>
<td width="40%" style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">电话</td>
<td width="60%"><a href="tel:${phone}" style="color:#111827;font-size:15px;font-weight:700;text-decoration:none;">${phone}</a></td>
</tr></table></td></tr>
<tr><td style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
<table width="100%"><tr>
<td width="40%" style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">邮政编码</td>
<td width="60%" style="color:#111827;font-size:15px;font-weight:700;">${zipCode}</td>
</tr></table></td></tr>
<tr><td style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
<table width="100%"><tr>
<td width="40%" style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">产品类型</td>
<td width="60%"><span style="background-color:#fef2f2;color:#b91c1c;font-size:13px;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block;">${productType || '未指定'}</span></td>
</tr></table></td></tr>
<tr><td style="padding:16px 0;">
<table width="100%"><tr>
<td width="40%" style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">项目类型</td>
<td width="60%"><span style="background-color:#f0fdf4;color:#15803d;font-size:13px;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block;">${projectType || '未指定'}</span></td>
</tr></table></td></tr>
</table>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
<a href="mailto:${email}" style="display:inline-block;background-color:#b91c1c;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:50px;text-decoration:none;">立即回复客户 →</a>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:20px 40px;border-top:1px solid #f0f0f0;">
<table width="100%"><tr>
<td style="color:#9ca3af;font-size:12px;">📅 申请时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</td>
<td align="right" style="color:#9ca3af;font-size:12px;">我的窗户公司 · 自动邮件</td>
</tr></table>
</td></tr>
<tr><td style="background-color:#111827;padding:24px 40px;text-align:center;">
<p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:12px;">© 2026 我的窗户公司 · 版权所有</p>
<p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;">此邮件由系统自动发送，请勿直接回复</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.EMAIL_USER,
      subject: '🏠 新报价申请 - ' + name,
      html: emailHtml
    });

    res.json({ success: true, message: '报价申请已发送！' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
