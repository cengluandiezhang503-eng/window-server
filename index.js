require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '服务器正常运行' });
});

app.post('/api/quote', async (req, res) => {
  const { name, email, phone, zipCode, productType, projectType } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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

app.listen(3001, () => {
  console.log('服务器运行在 http://localhost:3001');
});
