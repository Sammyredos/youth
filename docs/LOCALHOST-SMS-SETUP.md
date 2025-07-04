# 📱 Localhost SMS Setup Guide

This guide shows you how to set up SMS functionality on localhost for development and testing.

## 🎯 **Quick Setup for Localhost**

### **Option 1: Mock Provider (Recommended for Development)**

1. **Go to Settings** → **SMS Configuration**
2. **Click "Edit"**
3. **Enter these settings**:
   ```
   Enable SMS: true
   SMS Provider: mock
   SMS API Key: mock-api-key (or leave empty)
   SMS From Number: YouthReg
   ```

### **Option 2: Local African SMS Providers**

#### **For KudiSMS (Nigeria):**
```
Enable SMS: true
SMS Provider: kudisms
SMS API Key: [Your KudiSMS Password]
SMS Username: [Your KudiSMS Username]
SMS From Number: YouthReg
```

#### **For Termii (Multi-country):**
```
Enable SMS: true
SMS Provider: termii
SMS API Key: [Your Termii API Key]
SMS From Number: YouthReg
```

#### **For Bulk SMS Nigeria:**
```
Enable SMS: true
SMS Provider: bulk-sms-nigeria
SMS API Key: [Your API Token]
SMS From Number: YouthReg
```

#### **For Smart SMS Solutions:**
```
Enable SMS: true
SMS Provider: smart-sms
SMS API Key: [Your Smart SMS Password]
SMS Username: [Your Smart SMS Username]
SMS From Number: YouthReg
```

### **Option 3: International Providers**

#### **For Twilio:**
```
Enable SMS: true
SMS Provider: twilio
SMS API Key: [Your Account SID]
SMS API Secret: [Your Auth Token]
SMS From Number: [Your Twilio Phone Number]
```

#### **For AWS SNS:**
```
Enable SMS: true
SMS Provider: aws-sns
SMS API Key: [Your Access Key ID]
SMS API Secret: [Your Secret Access Key]
SMS Region: us-east-1 (or your preferred region)
```

## 🔧 **Environment Variables Setup**

Add these to your `.env.local` file:

```bash
# SMS Configuration
SMS_ENABLED=true
SMS_PROVIDER=mock  # or kudisms, termii, etc.
SMS_API_KEY=mock-api-key
SMS_FROM_NUMBER=YouthReg

# For KudiSMS/Smart SMS
SMS_USERNAME=your_username

# For Twilio
SMS_API_SECRET=your_auth_token

# For AWS SNS
SMS_REGION=us-east-1
```

## 🧪 **Testing SMS on Localhost**

### **Step 1: Configure SMS Settings**
1. **Navigate to**: http://localhost:3000/admin/settings
2. **Go to SMS Configuration section**
3. **Click "Edit"** and enter your SMS details
4. **Click "Save"**

### **Step 2: Test SMS Sending**
1. **In the SMS Configuration section**
2. **Enter any phone number** (e.g., +1234567890)
3. **Click "Send Test SMS"**
4. **Check your terminal** for the SMS log (mock provider)
5. **Check your phone** for real SMS (real providers)

### **Step 3: Test Bulk SMS**
1. **Go to Communications page**
2. **Switch to SMS tab**
3. **Select phone numbers**
4. **Click "Send Bulk SMS"**
5. **Check terminal/phone** for messages

## 🚨 **Troubleshooting Common Issues**

### **"Invalid SMS settings data" Error**

This usually means validation failed. Check:

1. **Enable SMS**: Must be true/false
2. **SMS Provider**: Must be one of the supported providers
3. **Required fields**: Check provider-specific requirements
4. **Phone number format**: Use international format (+1234567890)

### **"SMS Configuration Test Failed" Error**

1. **Check credentials**: Ensure API key/username are correct
2. **Check account balance**: Top up if insufficient funds
3. **Check phone number format**: Use international format
4. **Try mock provider**: Test with mock first

### **"Provider configuration invalid" Error**

1. **KudiSMS**: Requires API Key (password) and Username
2. **Termii**: Requires API Key only
3. **Bulk SMS Nigeria**: Requires API Token only
4. **Smart SMS**: Requires API Key (password) and Username
5. **Twilio**: Requires Account SID, Auth Token, and From Number
6. **AWS SNS**: Requires Access Key ID and Secret Access Key

### **SMS Not Received**

1. **Check recipient number** - Ensure it's valid and active
2. **Check sender ID** - Some networks block unregistered IDs
3. **Check account balance** - Ensure sufficient funds
4. **Try different number** - Test with different recipient

## 🔍 **Debug Mode**

To see detailed SMS logs:

1. **Open terminal** where you run `npm run dev`
2. **Check for SMS-related logs**
3. **Look for error messages**
4. **Use mock provider** for testing without real SMS

## 📱 **Mock Provider Benefits**

The mock provider is perfect for development:

- ✅ **No setup required** - Works immediately
- ✅ **No costs** - Free for unlimited testing
- ✅ **Detailed logs** - See SMS content in terminal
- ✅ **Fast testing** - No network delays
- ✅ **No rate limits** - Send as many as needed

## 💰 **Cost Comparison (Nigerian Providers)**

| Provider | Cost per SMS | Setup Difficulty | Coverage |
|----------|--------------|------------------|----------|
| Mock | Free | None | Development only |
| KudiSMS | ₦2.50-₦4.00 | Easy | Nigeria |
| Termii | ₦3.00-₦5.00 | Easy | Multi-country |
| Bulk SMS Nigeria | ₦2.00-₦3.50 | Easy | Nigeria |
| Smart SMS | ₦2.50-₦4.00 | Easy | Nigeria + International |
| Twilio | $0.05+ | Medium | International |
| AWS SNS | $0.05+ | Hard | International |

## ⚡ **Quick Fix for Current Error**

If you're getting the "Invalid SMS settings data" error right now:

1. **Open browser console** (F12)
2. **Go to Settings** → **SMS Configuration**
3. **Click "Edit"**
4. **Fill in required fields**:
   - Enable SMS: `true`
   - SMS Provider: `mock`
   - SMS API Key: `mock-api-key` (or leave empty)
   - SMS From Number: `YouthReg`
5. **Click "Save"**

## 🎉 **Success Indicators**

You'll know SMS is working when:

1. **Settings save successfully** without errors
2. **Test SMS** shows success message
3. **Mock SMS logs** appear in terminal (for mock provider)
4. **Real SMS received** on phone (for real providers)
5. **No error messages** in console/terminal

## 📞 **Provider Setup Links**

- **KudiSMS**: https://kudisms.net
- **Termii**: https://termii.com
- **Bulk SMS Nigeria**: https://bulksmsnigeria.com
- **Smart SMS**: https://smartsmssolutions.com
- **Twilio**: https://twilio.com
- **AWS SNS**: https://aws.amazon.com/sns/

## 🚀 **Ready to Use!**

Your SMS system supports:

1. **🔒 Development Mode** - Mock provider for testing
2. **🌍 Local Providers** - African SMS services
3. **🌐 International Providers** - Twilio, AWS SNS
4. **📱 Bulk Messaging** - Send to multiple recipients
5. **🧪 Test Functionality** - Built-in testing tools
6. **💰 Cost-Effective** - Choose based on your budget

The system is designed to work on localhost with proper configuration and scales to production! 🚀
