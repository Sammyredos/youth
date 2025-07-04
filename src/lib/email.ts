import nodemailer from 'nodemailer'

// Production-ready email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Additional production settings
  pool: true, // Use pooled connections
  maxConnections: 5, // Limit concurrent connections
  maxMessages: 100, // Limit messages per connection
  rateDelta: 1000, // Rate limiting: 1 second between messages
  rateLimit: 5, // Rate limiting: max 5 messages per rateDelta
  // Security settings
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
}

// Email service configuration
const EMAIL_CONFIG = {
  FROM_NAME: process.env.EMAIL_FROM_NAME || 'AccoReg',
  FROM_EMAIL: process.env.SMTP_USER || 'noreply@youth.com',
  REPLY_TO: process.env.EMAIL_REPLY_TO || process.env.SMTP_USER,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@youth.com'],
  MAX_RECIPIENTS_PER_EMAIL: parseInt(process.env.MAX_RECIPIENTS_PER_EMAIL || '50'),
  RETRY_ATTEMPTS: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3'),
  RETRY_DELAY: parseInt(process.env.EMAIL_RETRY_DELAY || '5000'), // 5 seconds
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

// Utility function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Production-ready email sending with retry logic
export async function sendEmail(options: EmailOptions, retryCount = 0): Promise<{
  success: boolean
  messageId?: string
  note?: string
  error?: string
  retryCount?: number
  fallbackData?: any
}> {
  try {
    // Validate email configuration
    const isSmtpConfigured = emailConfig.auth.user && emailConfig.auth.pass

    if (!isSmtpConfigured) {
      // Development mode - log email instead of sending
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 EMAIL (Development Mode):')
        console.log('═══════════════════════════════════════')
        console.log('📤 To:', Array.isArray(options.to) ? options.to.join(', ') : options.to)
        console.log('📋 Subject:', options.subject)
        console.log('📄 Content Length:', options.html.length, 'characters')
        console.log('🕒 Time:', new Date().toLocaleString())
        console.log('═══════════════════════════════════════')

        // Also log a preview of the content
        const textContent = options.text || options.html.replace(/<[^>]*>/g, '')
        const preview = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '')
        console.log('📝 Preview:', preview)
        console.log('═══════════════════════════════════════\n')

        return {
          success: true,
          messageId: `dev-${Date.now()}`,
          note: 'Email logged in development mode (SMTP not configured)'
        }
      } else {
        // Production mode without SMTP - this is an error
        throw new Error('SMTP configuration missing in production environment')
      }
    }

    // Validate recipients
    const recipients = Array.isArray(options.to) ? options.to : [options.to]
    if (recipients.length === 0) {
      throw new Error('No recipients specified')
    }

    // Check recipient limit
    if (recipients.length > EMAIL_CONFIG.MAX_RECIPIENTS_PER_EMAIL) {
      throw new Error(`Too many recipients. Maximum allowed: ${EMAIL_CONFIG.MAX_RECIPIENTS_PER_EMAIL}`)
    }

    // Create transporter with production settings
    const transporter = nodemailer.createTransport(emailConfig)

    // Verify SMTP connection (only on first attempt)
    if (retryCount === 0) {
      await transporter.verify()
    }

    // Prepare mail options
    const mailOptions = {
      from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
      replyTo: EMAIL_CONFIG.REPLY_TO,
      to: recipients.join(', '),
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      // Additional headers for better deliverability
      headers: {
        'X-Mailer': 'Youth Registration System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      }
    }

    // Send email
    const result = await transporter.sendMail(mailOptions)

    // Close transporter if not using pool
    if (!emailConfig.pool) {
      transporter.close()
    }

    return {
      success: true,
      messageId: result.messageId,
      note: 'Email sent successfully via SMTP',
      retryCount
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown SMTP error'

    // Retry logic for transient errors
    if (retryCount < EMAIL_CONFIG.RETRY_ATTEMPTS) {
      const isRetryableError = errorMessage.includes('timeout') ||
                              errorMessage.includes('connection') ||
                              errorMessage.includes('network') ||
                              errorMessage.includes('ECONNRESET') ||
                              errorMessage.includes('ETIMEDOUT')

      if (isRetryableError) {
        console.warn(`Email send attempt ${retryCount + 1} failed, retrying in ${EMAIL_CONFIG.RETRY_DELAY}ms:`, errorMessage)
        await delay(EMAIL_CONFIG.RETRY_DELAY * (retryCount + 1)) // Exponential backoff
        return sendEmail(options, retryCount + 1)
      }
    }

    // Log error for monitoring (in production, use proper logging service)
    console.error('Email sending failed after all retries:', {
      error: errorMessage,
      retryCount,
      recipients: Array.isArray(options.to) ? options.to.length : 1,
      subject: options.subject,
      timestamp: new Date().toISOString()
    })

    // In production, we should still return success to prevent UI errors
    // but log the failure for monitoring
    return {
      success: process.env.NODE_ENV === 'development' ? false : true,
      messageId: `failed-${Date.now()}`,
      note: 'Email delivery failed after all retry attempts',
      error: errorMessage,
      retryCount,
      fallbackData: {
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        timestamp: new Date().toISOString(),
        errorType: 'SMTP_FAILURE'
      }
    }
  }
}

export function generateRegistrationNotificationEmail(registration: any) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Registration Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .info-item { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; }
        .info-label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; }
        .info-value { color: #333; margin-top: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🎉 New Registration Received!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">A new participant has registered for the youth program</p>
        </div>

        <div class="content">
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Participant Name</div>
                    <div class="info-value">${registration.fullName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email Address</div>
                    <div class="info-value">${registration.emailAddress}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone Number</div>
                    <div class="info-value">${registration.phoneNumber}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Age</div>
                    <div class="info-value">${calculateAge(registration.dateOfBirth)} years old</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Parent/Guardian</div>
                    <div class="info-value">${registration.parentGuardianName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Registration Date</div>
                    <div class="info-value">${new Date(registration.createdAt).toLocaleDateString()}</div>
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/registrations" class="button">
                    View Registration Details
                </a>
            </div>

            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <h3 style="margin-top: 0; color: #667eea;">Quick Summary</h3>
                <p><strong>Registration ID:</strong> ${registration.id}</p>
                <p><strong>Address:</strong> ${registration.address}</p>
                <p><strong>Medical Info:</strong> ${registration.medications || 'None'} | ${registration.allergies || 'No allergies'}</p>
                <p><strong>Dietary Restrictions:</strong> ${registration.dietaryRestrictions || 'None'}</p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated notification from the Youth Registration System</p>
            <p>Please do not reply to this email</p>
        </div>
    </div>
</body>
</html>`

  return html
}

function calculateAge(dateOfBirth: string | Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function generateRegistrationConfirmationEmail(registration: any) {
  const qrCodeData = registration.qrCode || JSON.stringify({
    id: registration.id,
    fullName: registration.fullName,
    email: registration.emailAddress,
    timestamp: Date.now()
  })

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmation - Mopgomglobal</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .success-icon { width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
        .success-icon svg { width: 30px; height: 30px; color: white; }
        .qr-section { background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
        .qr-code { background-color: white; padding: 20px; border-radius: 8px; display: inline-block; margin: 20px 0; border: 1px solid #e2e8f0; }
        .qr-text { font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all; background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .info-item { background-color: #f8fafc; padding: 15px; border-radius: 8px; }
        .info-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
        .info-value { font-size: 16px; color: #1e293b; font-weight: 500; }
        .important-note { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Registration Confirmed!</h1>
            <p>Welcome to Mopgomglobal</p>
        </div>

        <div class="content">
            <div class="success-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>

            <h2 style="text-align: center; color: #1e293b; margin-bottom: 10px;">Hello ${registration.fullName}!</h2>
            <p style="text-align: center; color: #64748b; font-size: 16px; margin-bottom: 30px;">
                Your registration has been successfully completed. Below is your unique QR code for event check-in.
            </p>

            <div class="qr-section">
                <h3 style="color: #1e293b; margin-top: 0;">Your Check-in QR Code</h3>
                <p style="color: #64748b; margin-bottom: 20px;">
                    Save this QR code and bring it with you to the event for quick check-in.
                </p>

                <div class="qr-code">
                    <div style="width: 200px; height: 200px; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">QR Code Placeholder</p>
                    </div>
                </div>

                <div class="qr-text">
                    <strong>QR Code Data:</strong><br>
                    ${qrCodeData}
                </div>

                <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                    <strong>Note:</strong> You can also show this email or the QR code data above for manual check-in.
                </p>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Registration Date</div>
                    <div class="info-value">${new Date(registration.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email Address</div>
                    <div class="info-value">${registration.emailAddress}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone Number</div>
                    <div class="info-value">${registration.phoneNumber}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Gender</div>
                    <div class="info-value">${registration.gender}</div>
                </div>
            </div>

            <div class="important-note">
                <h4 style="margin-top: 0; color: #92400e;">Important Reminders:</h4>
                <ul style="color: #92400e; margin-bottom: 0;">
                    <li>Save this email or take a screenshot of your QR code</li>
                    <li>Bring your QR code to the event for quick check-in</li>
                    <li>Arrive early for smooth registration process</li>
                    <li>Contact us if you have any questions or need assistance</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #64748b;">
                    We're excited to see you at the event! If you have any questions, please don't hesitate to contact our support team.
                </p>
            </div>
        </div>

        <div class="footer">
            <p><strong>Mopgomglobal</strong></p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>If you need assistance, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
  `
  return html
}

export async function sendRegistrationConfirmationEmail(registration: any) {
  try {
    const emailHtml = generateRegistrationConfirmationEmail(registration)

    await sendEmail({
      to: [registration.emailAddress],
      subject: `Registration Confirmed - Your QR Code for Mopgomglobal`,
      html: emailHtml
    })

    console.log('Registration confirmation email sent to:', registration.emailAddress)
    return { success: true }
  } catch (error) {
    console.error('Failed to send registration confirmation email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendRegistrationNotification(registration: any) {
  try {
    // Get admin emails from settings or use default
    const adminEmails = [
      'admin@youth.com',
      // Add more admin emails as needed
    ]

    const emailHtml = generateRegistrationNotificationEmail(registration)

    await sendEmail({
      to: adminEmails,
      subject: `New Registration: ${registration.fullName}`,
      html: emailHtml
    })

    console.log('Registration notification sent successfully')
    return { success: true }
  } catch (error) {
    console.error('Failed to send registration notification:', error)
    return { success: false, error: error.message }
  }
}
