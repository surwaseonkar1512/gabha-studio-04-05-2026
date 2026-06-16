const PDFDocument = require('pdfkit');
const https = require('https');
const url = require('url');

// Helper to download remote images into buffers
function fetchImageBuffer(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      return resolve(null);
    }
    
    // Parse URL to check if it is secure
    const parsedUrl = url.parse(imageUrl);
    const client = parsedUrl.protocol === 'https:' ? https : require('http');

    client.get(imageUrl, { timeout: 5000 }, (res) => {
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

function generatePDF(data) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create new PDF document (A4 page size: 595.28 x 841.89 points)
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#7d4a3a';
      const secondaryColor = '#faf8f5';
      const accentBgColor = '#f5f1eb';
      const textColor = '#333333';
      const lightTextColor = '#666666';

      const fmt = (num) => Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Pre-fetch all branding images
      const logoBuffer = await fetchImageBuffer(data.logoUrl);
      const stampBuffer = await fetchImageBuffer(data.stampUrl);
      const signatureBuffer = await fetchImageBuffer(data.signatureUrl);
      const qrBuffer = await fetchImageBuffer(data.upiQrUrl);

      // --- PAGE 1 DESIGN ---

      // 1. Header Banner Background (Y: 0 to 120)
      doc.rect(0, 0, 595.28, 120).fill(primaryColor);

      // Logo drawing
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 35, 25, { width: 70, height: 70, fit: [70, 70] });
        } catch (e) {
          drawFallbackLogo(doc, 35, 25);
        }
      } else {
        drawFallbackLogo(doc, 35, 25);
      }

      // Studio Name & Tagline
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(24)
         .text(data.websiteName || 'GABHA STUDIO', 120, 35, { characterSpacing: 4 });

      doc.fillColor('rgba(255, 255, 255, 0.75)')
         .font('Helvetica')
         .fontSize(8.5)
         .text('CONTEMPORARY ART STUDIO', 120, 68, { characterSpacing: 3.5 });

      // Contact details (Right aligned)
      doc.fillColor('#ffffff')
         .fontSize(8.5)
         .font('Helvetica')
         .text('123 Creative Avenue, Mumbai, Maharashtra 400001', 340, 30, { width: 220, align: 'right', lineGap: 3 })
         .text('+91 9876543210', 340, 58, { width: 220, align: 'right', lineGap: 3 })
         .text('hello@gabhastudio.com', 340, 75, { width: 220, align: 'right', lineGap: 3 });

      // 2. Title & Metadata strip (Y: 135 to 195)
      const docType = data.type || 'QUOTATION';
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(20)
         .text(docType, 35, 140);

      // Title Underline
      doc.rect(35, 168, 50, 3).fill(primaryColor);

      // Paid stamp for paid invoices
      if (docType === 'FINAL SETTLEMENT INVOICE') {
        doc.rect(35, 178, 40, 16).fill('#2E7D32');
        doc.fillColor('#ffffff')
           .font('Helvetica-Bold')
           .fontSize(8.5)
           .text('PAID', 35, 182, { width: 40, align: 'center' });
      }

      // Metadata on the right
      const docNoLabel = docType.includes('QUOTATION') ? 'Quotation No.' : 'Invoice No.';
      doc.fillColor(textColor).font('Helvetica-Bold').fontSize(10).text(docNoLabel, 350, 140);
      doc.font('Helvetica').fontSize(10).text(`:  ${data.documentNo || '-'}`, 430, 140);

      doc.font('Helvetica-Bold').fontSize(10).text('Date', 350, 158);
      doc.font('Helvetica').fontSize(10).text(`:  ${data.date || '-'}`, 430, 158);

      if (data.validUntil) {
        doc.font('Helvetica-Bold').fontSize(10).text('Valid Until', 350, 176);
        doc.font('Helvetica').fontSize(10).text(`:  ${data.validUntil}`, 430, 176);
      }

      // 3. Customer & Project Details (Y: 205 to 300)
      const hasCustomer = !!data.customer;
      const hasProject = !!data.project;

      if (hasCustomer || hasProject) {
        const boxHeight = 90;
        const boxY = 205;

        if (hasCustomer && hasProject) {
          // Both side-by-side
          // Customer Box
          doc.rect(35, boxY, 250, boxHeight).fill(secondaryColor).stroke('#ddd8d0');
          doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text('BILL TO', 45, boxY + 10, { characterSpacing: 1.5 });
          doc.fillColor(textColor).font('Helvetica-Bold').fontSize(11).text(data.customer.name || '-', 45, boxY + 26);
          doc.fillColor(lightTextColor).font('Helvetica').fontSize(9)
             .text(`Phone: ${data.customer.phone || '-'}`, 45, boxY + 44)
             .text(`Email: ${data.customer.email || '-'}`, 45, boxY + 58)
             .text(`City: ${data.customer.location || '-'}`, 45, boxY + 72);

          // Project Box
          doc.rect(310, boxY, 250, boxHeight).fill(secondaryColor).stroke('#ddd8d0');
          doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text('PROJECT DETAILS', 320, boxY + 10, { characterSpacing: 1.5 });
          doc.fillColor(textColor).font('Helvetica-Bold').fontSize(11).text(data.project.name || '-', 320, boxY + 26);
          doc.fillColor(lightTextColor).font('Helvetica').fontSize(9)
             .text(`Type: ${data.project.type || '-'}`, 320, boxY + 44)
             .text(`Location: ${data.project.location || '-'}`, 320, boxY + 58)
             .text(`Timeline: ${data.project.timeline || '-'}`, 320, boxY + 72);
        } else {
          // Full width Box
          const fullBoxWidth = 525;
          doc.rect(35, boxY, fullBoxWidth, boxHeight).fill(secondaryColor).stroke('#ddd8d0');
          if (hasCustomer) {
            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text('BILL TO', 45, boxY + 10, { characterSpacing: 1.5 });
            doc.fillColor(textColor).font('Helvetica-Bold').fontSize(11).text(data.customer.name || '-', 45, boxY + 26);
            doc.fillColor(lightTextColor).font('Helvetica').fontSize(9)
               .text(`Phone: ${data.customer.phone || '-'}  |  Email: ${data.customer.email || '-'}  |  City: ${data.customer.location || '-'}`, 45, boxY + 44);
            if (data.customer.address) {
              doc.text(`Address: ${data.customer.address}`, 45, boxY + 58, { width: 505 });
            }
          }
        }
      }

      // 4. Items Table (Y: 310 onwards)
      let tableY = 310;
      doc.rect(35, tableY, 525, 22).fill(primaryColor);
      
      // Header labels
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5);
      doc.text('SR. NO.', 45, tableY + 7);
      doc.text('DESCRIPTION', 100, tableY + 7);
      doc.text('QTY', 350, tableY + 7, { width: 30, align: 'center' });
      doc.text('RATE (₹)', 390, tableY + 7, { width: 80, align: 'right' });
      doc.text('AMOUNT (₹)', 480, tableY + 7, { width: 70, align: 'right' });

      tableY += 22;
      const rowHeight = 22;

      (data.items || []).forEach((item, idx) => {
        // Alternating row background
        const rowBg = idx % 2 === 0 ? secondaryColor : accentBgColor;
        doc.rect(35, tableY, 525, rowHeight).fill(rowBg);
        
        doc.fillColor(textColor).font('Helvetica');
        doc.text(String(idx + 1).padStart(2, '0'), 45, tableY + 6);
        doc.font('Helvetica-Bold').text(item.description || '—', 100, tableY + 6, { width: 240, height: 14, ellipsis: true });
        doc.font('Helvetica').text(String(item.qty || 1), 350, tableY + 6, { width: 30, align: 'center' });
        doc.text(fmt(item.rate || item.amount), 390, tableY + 6, { width: 80, align: 'right' });
        doc.font('Helvetica-Bold').text(fmt(item.amount), 480, tableY + 6, { width: 70, align: 'right' });
        
        tableY += rowHeight;
      });

      // 5. Notes & Calculations block
      const boxStartY = tableY + 10;
      const leftColWidth = 280;
      const rightColWidth = 245;

      // Draw vertical separator line between notes and calculations
      doc.lineWidth(1).strokeColor('#e5e0d8').moveTo(35 + leftColWidth, boxStartY).lineTo(35 + leftColWidth, boxStartY + 140).stroke();

      // Left Column: Notes
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text('NOTES', 35, boxStartY, { characterSpacing: 1.5 });
      let notesY = boxStartY + 16;
      const notesList = Array.isArray(data.notes) ? data.notes : (data.notes ? [data.notes] : []);
      if (notesList.length > 0) {
        notesList.forEach((note) => {
          doc.fillColor(lightTextColor).font('Helvetica').fontSize(8.5)
             .text(`• ${note}`, 35, notesY, { width: leftColWidth - 15, lineGap: 3 });
          notesY += 22;
        });
      } else {
        doc.fillColor(lightTextColor).font('Helvetica-Oblique').fontSize(8.5).text('No notes provided.', 35, notesY);
      }

      // Right Column: Calculations
      let calcY = boxStartY;
      const drawCalcRow = (label, val, isBold = false, color = textColor) => {
        doc.fillColor(color).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).text(label, 35 + leftColWidth + 15, calcY);
        doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(val, 480, calcY, { width: 70, align: 'right' });
        calcY += 16;
      };

      drawCalcRow('Subtotal', `₹ ${fmt(data.subTotal)}`);

      if (data.discount) {
        drawCalcRow('Discount', `- ₹ ${fmt(data.discount)}`, false, '#c2410c');
      }

      if (data.gstEnabled || (data.gstAmount > 0)) {
        drawCalcRow(`GST (${data.gstPercentage || 18}%)`, `₹ ${fmt(data.gstAmount || 0)}`);
      }

      if (data.shipping) {
        drawCalcRow('Shipping', `₹ ${fmt(data.shipping)}`);
      }

      // Grand Total Highlight box
      calcY += 4;
      doc.rect(35 + leftColWidth + 10, calcY - 4, rightColWidth - 10, 24).fill(primaryColor);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('GRAND TOTAL', 35 + leftColWidth + 20, calcY + 3);
      doc.text(`₹ ${fmt(data.total)}`, 480, calcY + 3, { width: 70, align: 'right' });
      calcY += 26;

      // If Paid amount is present
      if (data.paidAmount !== undefined) {
        drawCalcRow('Total Paid So Far', `₹ ${fmt(data.paidAmount)}`, true, '#1b5e20');
        
        calcY += 4;
        const balance = Math.max(0, data.total - data.paidAmount);
        doc.rect(35 + leftColWidth + 10, calcY - 4, rightColWidth - 10, 24).fill('#222222');
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('REMAINING BALANCE', 35 + leftColWidth + 20, calcY + 3);
        doc.text(`₹ ${fmt(balance)}`, 480, calcY + 3, { width: 70, align: 'right' });
      }

      // 6. Terms, Bank Transfer & QR Details (Y: 590 to 700)
      const bottomY = 590;
      doc.lineWidth(1).strokeColor('#ddd8d0').moveTo(35, bottomY - 10).lineTo(560, bottomY - 10).stroke();

      // Divider columns
      doc.strokeColor('#ddd8d0').moveTo(240, bottomY).lineTo(240, bottomY + 100).stroke();
      doc.strokeColor('#ddd8d0').moveTo(435, bottomY).lineTo(435, bottomY + 100).stroke();

      // Terms Box (Left Column)
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text('TERMS & CONDITIONS', 35, bottomY, { characterSpacing: 1 });
      let termsY = bottomY + 14;
      const termsList = Array.isArray(data.terms) ? data.terms : (data.terms ? [data.terms] : []);
      termsList.slice(0, 4).forEach((term, idx) => {
        doc.fillColor(lightTextColor).font('Helvetica').fontSize(8)
           .text(`${idx + 1}. ${term}`, 35, termsY, { width: 190, lineGap: 2 });
        termsY += 20;
      });

      // Bank Details (Middle Column)
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text('BANK DETAILS', 255, bottomY, { characterSpacing: 1 });
      const drawBankRow = (label, val, yVal) => {
        doc.fillColor(textColor).font('Helvetica-Bold').fontSize(8).text(label, 255, yVal);
        doc.font('Helvetica').text(`:  ${val || '-'}`, 320, yVal, { width: 105, height: 11, ellipsis: true });
      };
      drawBankRow('A/C Name', data.bankAccountName || 'Gabha Studio', bottomY + 16);
      drawBankRow('Bank Name', data.bankName || 'HDFC Bank', bottomY + 30);
      drawBankRow('A/C No.', data.bankAccountNumber || '1234 5678 9012', bottomY + 44);
      drawBankRow('IFSC Code', data.bankIfscCode || 'HDFC0001234', bottomY + 58);
      drawBankRow('UPI ID', data.upiId || 'gabhastudio@hdfc', bottomY + 72);
      if (data.gstNumber) {
        drawBankRow('GSTIN', data.gstNumber, bottomY + 86);
      }

      // QR Code Scan to Pay (Right Column)
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text('SCAN TO PAY', 450, bottomY, { characterSpacing: 1, align: 'center', width: 95 });
      const qrBoxSize = 70;
      const qrX = 462;
      const qrY = bottomY + 14;

      if (qrBuffer) {
        try {
          doc.image(qrBuffer, qrX, qrY, { width: qrBoxSize, height: qrBoxSize });
        } catch (e) {
          drawFallbackQR(doc, qrX, qrY, qrBoxSize);
        }
      } else {
        drawFallbackQR(doc, qrX, qrY, qrBoxSize);
      }
      doc.fillColor(lightTextColor).font('Helvetica').fontSize(7.5).text(`UPI ID: ${data.upiId || 'gabhastudio@hdfc'}`, 440, bottomY + 88, { width: 115, align: 'center' });

      // 7. Stamp & Signature block (Y: 710 to 790)
      const footerStartY = 710;
      doc.lineWidth(1).strokeColor('#ddd8d0').moveTo(35, footerStartY - 5).lineTo(560, footerStartY - 5).stroke();

      // Stamp Area (Left)
      doc.fillColor(lightTextColor).font('Helvetica-Bold').fontSize(8.5).text('Company Stamp', 75, footerStartY, { align: 'center', width: 100 });
      if (stampBuffer) {
        try {
          doc.image(stampBuffer, 85, footerStartY + 12, { width: 65, height: 65, fit: [65, 65] });
        } catch (e) {
          drawFallbackStamp(doc, 85, footerStartY + 12);
        }
      } else {
        drawFallbackStamp(doc, 85, footerStartY + 12);
      }

      // Signature Area (Right)
      const sigX = 380;
      doc.fillColor(textColor).font('Helvetica-Bold').fontSize(9).text(`For ${data.websiteName || 'Gabha Studio'}`, sigX, footerStartY, { align: 'center', width: 150 });
      if (signatureBuffer) {
        try {
          doc.image(signatureBuffer, sigX + 25, footerStartY + 16, { width: 100, height: 35, fit: [100, 35] });
        } catch (e) {
          drawFallbackSignature(doc, sigX, footerStartY + 16);
        }
      } else {
        drawFallbackSignature(doc, sigX, footerStartY + 16);
      }
      // Line under signature
      doc.strokeColor('#888888').lineWidth(0.8).moveTo(sigX + 10, footerStartY + 58).lineTo(sigX + 140, footerStartY + 58).stroke();
      doc.fillColor(lightTextColor).font('Helvetica').fontSize(8.5).text('Authorized Signatory', sigX, footerStartY + 63, { align: 'center', width: 150 });

      // 8. Final bottom strip (Y: 810 to 842)
      doc.rect(0, 812, 595.28, 30).fill(primaryColor);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5).text('——   CREATING STORIES THROUGH ART   ——', 0, 822, { align: 'center', width: 595.28, characterSpacing: 2 });

      // End PDF Generation
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Draw a elegant fallback vector logo
function drawFallbackLogo(doc, x, y) {
  doc.save();
  // Draw an outer triangle shape
  doc.strokeColor('rgba(255,255,255,0.55)').lineWidth(2.5);
  doc.polygon([x + 35, y + 4], [x + 67, y + 64], [x + 3, y + 64]).stroke();
  
  // Draw inner solid filled triangle
  doc.fillColor('rgba(255,255,255,0.2)');
  doc.polygon([x + 35, y + 15], [x + 58, y + 57], [x + 12, y + 57]).fill();
  
  // Draw logo text
  doc.fillColor('rgba(255,255,255,0.8)').font('Helvetica-Bold').fontSize(7).text('STUDIO', x, y + 68, { width: 70, align: 'center' });
  doc.restore();
}

// Draw simulated vector QR code
function drawFallbackQR(doc, x, y, size) {
  doc.save();
  doc.rect(x, y, size, size).fill('#ffffff').stroke('#7d4a3a');
  
  const modules = 21;
  const cell = size / modules;

  // Simple deterministic pattern based on coordinate indices
  function isCellFilled(r, c) {
    // Corner finders (7x7 squares)
    if (r < 7 && c < 7) {
      return (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
    }
    if (r < 7 && c >= modules - 7) {
      const nc = c - (modules - 7);
      return (r === 0 || r === 6 || nc === 0 || nc === 6 || (r >= 2 && r <= 4 && nc >= 2 && nc <= 4));
    }
    if (r >= modules - 7 && c < 7) {
      const nr = r - (modules - 7);
      return (nr === 0 || nr === 6 || c === 0 || c === 6 || (nr >= 2 && nr <= 4 && c >= 2 && c <= 4));
    }

    // Timing patterns
    if (r === 6 || c === 6) {
      return (r % 2 === 0 && c % 2 === 0);
    }

    // Pseudo-random data dots
    return ((r * 7 + c * 13) % 5 === 0 || (r * c) % 3 === 0);
  }

  doc.fillColor('#1a1a1a');
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (isCellFilled(r, c)) {
        doc.rect(x + c * cell, y + r * cell, cell - 0.2, cell - 0.2).fill();
      }
    }
  }
  doc.restore();
}

// Draw simulated vector stamp
function drawFallbackStamp(doc, x, y) {
  doc.save();
  const radius = 32;
  const cx = x + 32;
  const cy = y + 32;

  // Draw circular border
  doc.strokeColor('#7d4a3a').lineWidth(2);
  doc.circle(cx, cy, radius).stroke();
  doc.circle(cx, cy, radius - 4).stroke();

  // Draw central triangle icon
  doc.fillColor('#7d4a3a');
  doc.polygon([cx, cy - 14], [cx + 12, cy + 10], [cx - 12, cy + 10]).fill();

  // Draw text tags inside stamp
  doc.fillColor('#7d4a3a').font('Helvetica-Bold').fontSize(4.5);
  doc.text('GABHA STUDIO', cx - 30, cy - 22, { width: 60, align: 'center' });
  doc.text('ART INSTALLATIONS', cx - 30, cy + 15, { width: 60, align: 'center' });

  doc.restore();
}

// Draw signature text fallback
function drawFallbackSignature(doc, x, y) {
  doc.save();
  doc.fillColor('#333333')
     .font('Times-Italic')
     .fontSize(28)
     .text('Gabha', x, y + 10, { align: 'center', width: 150 });
  doc.restore();
}

module.exports = { generatePDF };
