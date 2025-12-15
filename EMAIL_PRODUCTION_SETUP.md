# 📧 Email Configuration for Production (Render)

## ⚠️ VẤN ĐỀ

Email notifications không hoạt động trên production vì thiếu environment variables trên Render.

---

## 🔧 GIẢI PHÁP - Thêm Environment Variables trên Render

### Bước 1: Vào Render Dashboard

1. Truy cập: https://dashboard.render.com
2. Chọn backend service của bạn
3. Vào tab **Environment**

### Bước 2: Thêm Email Environment Variables

Click **Add Environment Variable** và thêm các biến sau:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=binh141023@gmail.com
EMAIL_PASSWORD=kulm apbg xzjg utbk
EMAIL_FROM=Travel Booking <binh141023@gmail.com>
```

### Bước 3: Thêm các biến khác (nếu chưa có)

```bash
# Frontend/Backend URLs
FRONTEND_URL=https://pathwayblog.netlify.app
BACKEND_URL=https://path-way.onrender.com

# Database (should already exist)
MONGODB_URL=mongodb+srv://binh14102003:MR6HRxMz1hH0QaHa@blog-website.afn9m.mongodb.net/Blog?retryWrites=true&w=majority&appName=Blog-website

# JWT Secret (should already exist)
SECRET_ACCESS_KEY=3e76458cb1d28ea909ad9365fa2503728666fe89698bc6e10673b29df04c7027d63e17f03153862f2371bad4b3e89dc091f18f6dddfda7341b3583922656c1e3

# AWS (for file uploads - should already exist)
AWS_ACCESS_KEY=AKIAWCZC5PLD5PR3CG4F
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=ap-southeast-2
```

### Bước 4: Save và Redeploy

Sau khi thêm tất cả variables:

1. Click **Save Changes**
2. Render sẽ tự động redeploy (2-3 phút)

---

## ✅ VERIFY Email Works

### Test 1: Send Test Email

```bash
# SSH vào Render hoặc test local
node src/testEmail.js
```

### Test 2: Trigger Email từ App

1. Tạo booking mới trên production
2. Kiểm tra email inbox
3. Xem Render logs: `Settings > Logs`

### Test 3: Check Logs

```bash
# Trong Render Logs, tìm:
✅ "Email sent successfully"
hoặc
❌ "Error sending email"
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Invalid login" error

**Nguyên nhân**: Gmail App Password không đúng hoặc hết hạn

**Giải pháp**:

1. Vào Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification
3. Tạo App Password mới cho "Mail"
4. Copy password mới (16 ký tự không có space)
5. Update `EMAIL_PASSWORD` trên Render

### Issue 2: "Connection timeout"

**Nguyên nhân**: Port 587 bị block

**Giải pháp**:

```bash
# Thử đổi sang port 465 (SSL)
EMAIL_PORT=465
# Và update emailService.js: secure: true
```

### Issue 3: Email vào Spam

**Nguyên nhân**: Email từ domain không verified

**Giải pháp**:

- Dùng custom domain với SPF/DKIM records
- Hoặc dùng email service như SendGrid, Mailgun

### Issue 4: Rate limit exceeded

**Nguyên nhân**: Gmail giới hạn 500 emails/day

**Giải pháp**:

- Nâng cấp lên G Suite (2000 emails/day)
- Hoặc dùng email service chuyên nghiệp

---

## 🔐 BẢO MẬT

### ⚠️ KHÔNG BAO GIỜ:

- ❌ Commit `.env` file vào Git
- ❌ Share email password công khai
- ❌ Hardcode credentials trong code

### ✅ NÊN:

- ✅ Dùng environment variables
- ✅ Dùng Gmail App Password (không phải password chính)
- ✅ Enable 2FA cho email account
- ✅ Rotate passwords định kỳ

---

## 📋 CHECKLIST

### Render Environment Variables:

- [ ] `EMAIL_HOST` = smtp.gmail.com
- [ ] `EMAIL_PORT` = 587
- [ ] `EMAIL_USER` = your-email@gmail.com
- [ ] `EMAIL_PASSWORD` = your-app-password
- [ ] `EMAIL_FROM` = Your Name <your-email@gmail.com>
- [ ] `FRONTEND_URL` = https://pathwayblog.netlify.app
- [ ] `BACKEND_URL` = https://path-way.onrender.com

### Gmail Setup:

- [ ] 2-Step Verification enabled
- [ ] App Password created
- [ ] "Less secure apps" setting (if needed)

### Testing:

- [ ] Test email sends successfully
- [ ] Check email arrives in inbox (not spam)
- [ ] Verify booking confirmation emails
- [ ] Verify payment receipt emails
- [ ] Check Render logs for errors

---

## 🚀 ALTERNATIVE: SendGrid (Recommended for Production)

Nếu Gmail không ổn định, dùng SendGrid:

### 1. Sign up: https://sendgrid.com/

### 2. Create API Key

### 3. Update Environment Variables:

```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com
```

### Benefits:

- ✅ 100 emails/day free
- ✅ Better deliverability
- ✅ Email analytics
- ✅ No Gmail rate limits

---

## 📊 Email Types Supported

1. **Booking Confirmation** - Sent after successful booking
2. **Payment Receipt** - Sent after payment completed
3. **Booking Cancellation** - Sent when booking cancelled
4. **Password Reset** - Sent for password recovery

---

**Created**: ${new Date().toLocaleString('vi-VN')}
**Status**: Ready to deploy 🚀
