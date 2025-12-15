# ⚡ Quick Fix - Email Not Working on Production

## 🎯 TÓM TẮT VẤN ĐỀ
Email notifications không hoạt động trên Render production vì thiếu environment variables.

---

## ✅ GIẢI PHÁP NHANH (5 phút)

### 1️⃣ Vào Render Dashboard
```
https://dashboard.render.com → Your Backend Service → Environment
```

### 2️⃣ Add These Environment Variables:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=binh141023@gmail.com
EMAIL_PASSWORD=kulm apbg xzjg utbk
EMAIL_FROM=Travel Booking <binh141023@gmail.com>
```

### 3️⃣ Also Make Sure These Exist:

```bash
FRONTEND_URL=https://pathwayblog.netlify.app
BACKEND_URL=https://path-way.onrender.com
```

### 4️⃣ Save & Wait for Redeploy
- Render will auto-redeploy (2-3 minutes)
- Check logs for "Email sent successfully"

---

## 🧪 TEST EMAIL (Local)

```bash
cd backend
node scripts/verifyEmailConfig.js
```

**Expected Output:**
```
✅ All email environment variables are configured!
✅ SMTP connection successful!
✅ Test email sent successfully!
```

---

## 📋 CHECKLIST

- [ ] Added `EMAIL_HOST` to Render
- [ ] Added `EMAIL_PORT` to Render  
- [ ] Added `EMAIL_USER` to Render
- [ ] Added `EMAIL_PASSWORD` to Render
- [ ] Added `EMAIL_FROM` to Render
- [ ] Render redeployed successfully
- [ ] Test booking → email received
- [ ] Check Render logs → no email errors

---

## 🐛 IF STILL NOT WORKING

### Check Render Logs:
```
Render Dashboard → Your Service → Logs
```

Look for:
- ❌ `Error sending email`
- ❌ `Invalid login`
- ❌ `Connection timeout`

### Common Issues:

**1. Invalid Login**
- Gmail password expired
- Need to create new App Password
- Go to: https://myaccount.google.com/apppasswords

**2. Connection Timeout**
- Port 587 might be blocked
- Try port 465 instead

**3. Email Goes to Spam**
- Normal for first emails
- Check spam folder

---

## 📚 Full Documentation
See: `EMAIL_PRODUCTION_SETUP.md` for detailed guide

---

**Status**: ✅ Tested locally, ready for production
**Next**: Add environment variables to Render → Done!
