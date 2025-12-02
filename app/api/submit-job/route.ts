import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { Shape, Material } from '@/lib/types'
import { calculateQuote, formatQuoteForEmail } from '@/lib/quoteCalculation'
import { exportBendInstructionsText } from '@/lib/exportSVG'

// Engineer's email - can be configured via environment variable
const ENGINEER_EMAIL = process.env.ENGINEER_EMAIL || 'engineer@spartandesign.com'

export async function POST(request: NextRequest) {
  try {
    // Initialize Resend with API key (only when route is called)
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }
    const resend = new Resend(apiKey)

    const body = await request.json()
    const { customerDetails, shapes, material, svgContent } = body

    // Validate required fields
    if (!customerDetails || !shapes || !material || !svgContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate quote
    const quote = calculateQuote(shapes as Shape[], material as Material)
    const quoteText = formatQuoteForEmail(quote)

    // Check for bends and holes
    const totalBends = (shapes as Shape[]).reduce(
      (sum, shape) => sum + (shape.bends?.length || 0),
      0
    )
    const totalHoles = (shapes as Shape[]).reduce(
      (sum, shape) => sum + (shape.holes?.length || 0),
      0
    )
    const hasBends = totalBends > 0
    const hasHoles = totalHoles > 0

    // Prepare email HTML content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #3b82f6;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 0 0 8px 8px;
    }
    .section {
      background-color: white;
      padding: 15px;
      margin: 15px 0;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 5px;
    }
    .info-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .info-label {
      font-weight: bold;
      width: 200px;
      color: #6b7280;
    }
    .info-value {
      flex: 1;
      color: #1f2937;
    }
    .quote-highlight {
      background-color: #fef3c7;
      padding: 15px;
      border-left: 4px solid #f59e0b;
      margin: 15px 0;
      border-radius: 4px;
    }
    .quote-total {
      font-size: 24px;
      font-weight: bold;
      color: #f59e0b;
    }
    pre {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 12px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🔧 New Laser Cutting Job Request</h1>
    <p style="margin: 5px 0 0 0;">From Spartan Design Platform</p>
  </div>

  <div class="content">
    <div class="section">
      <div class="section-title">👤 Customer Information</div>
      <div class="info-row">
        <span class="info-label">Full Name:</span>
        <span class="info-value">${customerDetails.fullName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value"><a href="mailto:${customerDetails.email}">${customerDetails.email}</a></span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span class="info-value"><a href="tel:${customerDetails.phone}">${customerDetails.phone}</a></span>
      </div>
      ${
        customerDetails.companyName
          ? `
      <div class="info-row">
        <span class="info-label">Company:</span>
        <span class="info-value">${customerDetails.companyName}</span>
      </div>
      `
          : ''
      }
      ${
        customerDetails.notes
          ? `
      <div class="info-row">
        <span class="info-label">Notes:</span>
        <span class="info-value">${customerDetails.notes}</span>
      </div>
      `
          : ''
      }
    </div>

    <div class="section">
      <div class="section-title">📐 Design Specifications</div>
      <div class="info-row">
        <span class="info-label">Material:</span>
        <span class="info-value">${material.name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Thickness:</span>
        <span class="info-value">${material.thickness}${material.unit}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Number of Shapes:</span>
        <span class="info-value">${shapes.length}</span>
      </div>
      ${
        hasHoles
          ? `
      <div class="info-row">
        <span class="info-label">Total Holes:</span>
        <span class="info-value">${totalHoles}</span>
      </div>
      `
          : ''
      }
      ${
        hasBends
          ? `
      <div class="info-row">
        <span class="info-label">Sheet Metal Bends:</span>
        <span class="info-value" style="color: #ea580c; font-weight: bold;">${totalBends} bend(s) required</span>
      </div>
      `
          : ''
      }
    </div>

    ${
      hasBends
        ? `
    <div class="section">
      <div class="section-title">🔧 Bend Instructions</div>
      <p style="color: #ea580c; font-weight: bold; margin-bottom: 10px;">⚠️ This design requires sheet metal bending operations</p>
      <p>Step-by-step bend instructions are attached as a plain text file (.txt). Each bend includes:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Bend line position and orientation</li>
        <li>Bend angle and direction</li>
        <li>Inside bend radius</li>
        <li>Detailed step-by-step procedure</li>
        <li>Sheet dimensions and important notes</li>
      </ul>
      <p style="font-style: italic; color: #6b7280; font-size: 14px;">
        Bend lines are also marked on the SVG file with orange dashed lines and annotations.
      </p>
    </div>
    `
        : ''
    }

    <div class="section">
      <div class="section-title">💰 Quote Details</div>
      <div class="info-row">
        <span class="info-label">Total Area:</span>
        <span class="info-value">${(quote.totalArea * 10000).toFixed(2)} cm² (${quote.totalArea.toFixed(6)} m²)</span>
      </div>
      ${quote.shapes
        .map(
          shape => `
      <div class="info-row">
        <span class="info-label">${shape.type}:</span>
        <span class="info-value">${shape.count} piece(s), ${(shape.area * 10000).toFixed(2)} cm²</span>
      </div>
      `
        )
        .join('')}

      <div class="quote-highlight">
        <div style="margin-bottom: 10px;">Estimated Material Cost:</div>
        <div class="quote-total">$${quote.materialCost.toFixed(2)}</div>
        <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
          Based on ${material.name} at $${material.pricePerSquareMeter.toFixed(2)}/m²
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📄 Design File</div>
      <p>The laser cutting design is attached as an SVG file. You can open it in any vector graphics software or laser cutting control software.</p>
    </div>
  </div>

  <div class="footer">
    <p>This is an automated email from Spartan Design.</p>
    <p>Submitted on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `

    // Prepare attachments
    const attachments: any[] = [
      {
        filename: `design-${Date.now()}.svg`,
        content: Buffer.from(svgContent).toString('base64'),
        contentType: 'image/svg+xml',
      },
    ]

    // Add bend instructions as plain text if there are bends
    if (hasBends) {
      const bendInstructionsText = exportBendInstructionsText(shapes as Shape[])
      attachments.push({
        filename: `bend-instructions-${Date.now()}.txt`,
        content: Buffer.from(bendInstructionsText).toString('base64'),
        contentType: 'text/plain',
      })
    }

    // Send email with attachments
    const { data, error } = await resend.emails.send({
      from: 'Spartan Design <onboarding@resend.dev>',
      to: [ENGINEER_EMAIL],
      replyTo: customerDetails.email,
      subject: `New Job Request from ${customerDetails.fullName} - ${material.name} ${material.thickness}${material.unit}${hasBends ? ' [BENDING REQUIRED]' : ''}`,
      html: emailHtml,
      attachments,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      quote,
    })
  } catch (error) {
    console.error('Submit job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
