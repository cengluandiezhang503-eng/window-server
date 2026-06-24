require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.json({ message: '服务器正常运行' });
});

app.post('/api/quote', async (req, res) => {
  const { name, email, phone, zipCode, productType, projectType } = req.body;
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.EMAIL_USER,
      subject: '新报价申请',
      html: `
        <h2>新报价申请</h2>
        <p><b>姓名：</b>${name}</p>
        <p><b>邮箱：</b>${email}</p>
        <p><b>电话：</b>${phone}</p>
        <p><b>邮编：</b>${zipCode}</p>
        <p><b>产品类型：</b>${productType}</p>
        <p><b>项目类型：</b>${projectType}</p>
      `
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
