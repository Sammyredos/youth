import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendRegistrationNotification, sendRegistrationConfirmationEmail } from '@/lib/email'
import { generateRegistrationQR } from '@/lib/qr-code'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const requiredFields = [
      'fullName',
      'dateOfBirth',
      'gender',
      'address',
      'phoneNumber',
      'emailAddress',
      'parentGuardianName',
      'parentGuardianPhone'
      // parentGuardianEmail is optional
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          {
            error: `${field} is required`,
            field: field,
            message: `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`
          },
          { status: 400 }
        )
      }
    }

    // Convert dateOfBirth to Date object
    const dateOfBirth = new Date(data.dateOfBirth)
    if (isNaN(dateOfBirth.getTime())) {
      return NextResponse.json(
        {
          error: 'Invalid date of birth',
          field: 'dateOfBirth',
          message: 'Please enter a valid date of birth'
        },
        { status: 400 }
      )
    }

    // Validate email format if provided (parentGuardianEmail is optional)
    if (data.parentGuardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parentGuardianEmail)) {
      return NextResponse.json(
        { error: 'Invalid parent/guardian email format' },
        { status: 400 }
      )
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        fullName: data.fullName,
        dateOfBirth: dateOfBirth,
        gender: data.gender,
        address: data.address,
        phoneNumber: data.phoneNumber,
        emailAddress: data.emailAddress,
        // Use emergency contact info (either manually entered or copied from parent)
        emergencyContactName: data.emergencyContactName || data.parentGuardianName,
        emergencyContactRelationship: data.emergencyContactRelationship || 'Parent/Guardian',
        emergencyContactPhone: data.emergencyContactPhone || data.parentGuardianPhone,
        parentGuardianName: data.parentGuardianName,
        parentGuardianPhone: data.parentGuardianPhone,
        parentGuardianEmail: data.parentGuardianEmail,
        roommateRequestConfirmationNumber: null, // Field removed from form
        medications: data.medications || null,
        allergies: data.allergies || null,
        specialNeeds: data.specialNeeds || null,
        dietaryRestrictions: data.dietaryRestrictions || null,
        parentalPermissionGranted: true, // Always mark as completed/approved
        parentalPermissionDate: new Date() // Set current date as completion date
      }
    })

    // Generate QR code for the registration
    try {
      const qrResult = await generateRegistrationQR(registration.id)
      if (qrResult.success) {
        console.log('QR code generated for registration:', registration.id)
      } else {
        console.error('Failed to generate QR code:', qrResult.error)
        // Don't fail the registration if QR generation fails
      }
    } catch (qrError) {
      console.error('QR code generation error:', qrError)
      // Don't fail the registration if QR generation fails
    }

    // Create notification record in database
    try {
      await prisma.notification.create({
        data: {
          type: 'new_registration',
          title: 'New Registration',
          message: `${registration.fullName} has registered for the youth program`,
          priority: 'medium',
          metadata: JSON.stringify({
            registrationId: registration.id,
            participantName: registration.fullName,
            participantEmail: registration.emailAddress,
            participantPhone: registration.phoneNumber,
            parentGuardian: registration.parentGuardianName,
            registrationDate: registration.createdAt
          })
        }
      })
      console.log('Database notification created for:', registration.fullName)
    } catch (notificationError) {
      console.error('Failed to create notification record:', notificationError)
      // Don't fail the registration if notification creation fails
    }

    // Send confirmation email with QR code to registrant
    try {
      await sendRegistrationConfirmationEmail(registration)
      console.log('Registration confirmation email sent to:', registration.emailAddress)
    } catch (emailError) {
      console.error('Failed to send registration confirmation email:', emailError)
      // Don't fail the registration if email fails
    }

    // Send notification email to admins (don't wait for it to complete)
    try {
      await sendRegistrationNotification(registration)
      console.log('Registration notification sent for:', registration.fullName)
    } catch (emailError) {
      console.error('Failed to send registration notification:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      message: 'Registration submitted successfully'
    })
  } catch (error) {
    console.error('Registration submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
