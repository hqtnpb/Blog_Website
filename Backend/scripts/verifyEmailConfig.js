#!/usr/bin/env node

/**
 * Script to verify email configuration
 * Run: node scripts/verifyEmailConfig.js
 */

require('dotenv').config();

const checkEmailConfig = () => {
  console.log('\n📧 Checking Email Configuration...\n');

  const requiredVars = {
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
  };

  let allConfigured = true;

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${key.includes('PASSWORD') ? '****' : value}`);
    } else {
      console.log(`❌ ${key}: NOT SET`);
      allConfigured = false;
    }
  });

  console.log('\n');

  if (allConfigured) {
    console.log('✅ All email environment variables are configured!\n');
    return true;
  } else {
    console.log('❌ Some email environment variables are missing!');
    console.log('\nPlease add the following to your .env file or Render environment:');
    console.log('  - EMAIL_HOST=smtp.gmail.com');
    console.log('  - EMAIL_PORT=587');
    console.log('  - EMAIL_USER=your-email@gmail.com');
    console.log('  - EMAIL_PASSWORD=your-app-password');
    console.log('  - EMAIL_FROM=Your Name <your-email@gmail.com>\n');
    return false;
  }
};

const testEmailConnection = async () => {
  if (!checkEmailConfig()) {
    process.exit(1);
  }

  console.log('🔌 Testing SMTP connection...\n');

  const nodemailer = require('nodemailer');

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📨 Sending test email...\n');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to self
      subject: '✅ Email Configuration Test - Success',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">✅ Email Configuration Successful!</h2>
          <p>Your email service is properly configured and working.</p>
          <hr>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Host: ${process.env.EMAIL_HOST}</li>
            <li>Port: ${process.env.EMAIL_PORT}</li>
            <li>User: ${process.env.EMAIL_USER}</li>
          </ul>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`\n📧 Check your inbox: ${process.env.EMAIL_USER}\n`);

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if EMAIL_USER and EMAIL_PASSWORD are correct');
    console.error('2. For Gmail, use App Password (not your regular password)');
    console.error('3. Enable 2-Step Verification in Google Account');
    console.error('4. Create App Password at: https://myaccount.google.com/apppasswords');
    console.error('5. Check if port 587 is not blocked by firewall\n');
    process.exit(1);
  }
};

// Run the test
testEmailConnection().catch(console.error);
