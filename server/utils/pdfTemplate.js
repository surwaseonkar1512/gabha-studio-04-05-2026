function generatePDFHTML(data) {
  // Format numbers to INR currency style
  const fmt = (num) => Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const documentType = data.type || 'QUOTATION';
  const documentNoLabel = documentType === 'QUOTATION' ? 'Quotation No.' : 'Invoice No.';

  // Build items rows
  const itemsHtml = (data.items || []).map((item, idx) => `
    <tr>
      <td>${String(idx + 1).padStart(2, '0')}</td>
      <td>${item.description || '—'}</td>
      <td style="text-align:center">${item.qty || 1}</td>
      <td style="text-align:right">${fmt(item.rate || item.amount)}</td>
      <td>${fmt(item.amount)}</td>
    </tr>
  `).join('');

  // Build notes list
  const notesHtml = Array.isArray(data.notes)
    ? data.notes.map(n => `<li>${n}</li>`).join('')
    : data.notes ? `<li>${data.notes}</li>` : '<li>No notes provided.</li>';

  // Build terms list
  const termsHtml = Array.isArray(data.terms)
    ? data.terms.map(t => `<li>${t}</li>`).join('')
    : data.terms ? `<li>${data.terms}</li>` : '<li>Payment due as agreed.</li>';

  const customerHtml = data.customer ? `
    <div class="bill-box">
      <div class="section-icon-label">
        <div class="icon-box">
          <svg viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="7" r="4"/>
            <path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
          </svg>
        </div>
        <div class="section-label">Bill To</div>
      </div>
      ${data.customer.company ? `<div class="bill-company">${data.customer.company}</div>` : ''}
      <div class="bill-person">${data.customer.name || '-'}</div>
      <div class="bill-detail">
        <svg viewBox="0 0 16 16" fill="#666" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 2h2.5l1 3-1.5 1.5A9 9 0 0 0 8.5 10L10 8.5l3 1V12a1 1 0 0 1-1 1C5.4 13 2 9.6 2 5a1 1 0 0 1 1-3z"/>
        </svg>
        ${data.customer.phone || '-'}
      </div>
      ${data.customer.email ? `
      <div class="bill-detail">
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="12" height="9" rx="1" stroke="#666" stroke-width="1.3"/>
          <path d="M2 5l6 5 6-5" stroke="#666" stroke-width="1.3"/>
        </svg>
        ${data.customer.email}
      </div>` : ''}
      ${data.customer.location ? `
      <div class="bill-detail">
        <svg viewBox="0 0 16 16" fill="#666" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 8 4a1.5 1.5 0 0 1 0 3.5z"/>
        </svg>
        ${data.customer.location}
      </div>` : ''}
    </div>
  ` : '';

  const projectHtml = data.project ? `
    <div class="project-box">
      <div class="section-icon-label">
        <div class="icon-box">
          <svg viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="7" width="16" height="11" rx="2"/>
            <path d="M7 7V5a3 3 0 0 1 6 0v2" stroke="white" stroke-width="1.5" fill="none"/>
            <line x1="2" y1="12" x2="18" y2="12" stroke="rgba(125,74,58,0.4)" stroke-width="1.2"/>
          </svg>
        </div>
        <div class="section-label" style="color:#7d4a3a;">Project Details</div>
      </div>
      <div class="project-name">${data.project.name || '-'}</div>
      <div class="project-type">${data.project.type || '-'}</div>
      <div class="project-detail"><span>Location :</span>  ${data.project.location || '-'}</div>
      <div class="project-detail"><span>Timeline :</span>  ${data.project.timeline || '-'}</div>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gabha Studio – ${documentType} ${data.documentNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Montserrat', sans-serif;
    background: #f0ece6;
    display: flex;
    justify-content: center;
    padding: 0;
    margin: 0;
  }

  .page {
    background: #faf8f5;
    width: 820px;
  }

  /* ── HEADER ── */
  .header {
    background: #7d4a3a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 40px 28px 36px;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .logo-mark {
    width: 72px;
    height: 72px;
    position: relative;
    flex-shrink: 0;
  }

  .logo-mark svg { width: 100%; height: 100%; }

  .logo-text-block {
    display: flex;
    flex-direction: column;
  }

  .logo-studio-name {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 7px;
    color: #ffffff;
    line-height: 1;
  }

  .logo-tagline {
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 5px;
    color: rgba(255,255,255,0.75);
    margin-top: 5px;
  }

  .header-contact {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .contact-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.88);
    font-size: 12px;
    font-weight: 400;
  }

  .contact-row .icon {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* ── QUOTATION INFO STRIP ── */
  .quote-meta-section {
    padding: 30px 40px 26px 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #ddd8d0;
  }

  .quotation-title {
    font-size: 24px;
    font-weight: 800;
    color: #7d4a3a;
    letter-spacing: 1px;
    line-height: 1;
  }

  .quotation-title-underline {
    width: 44px;
    height: 3px;
    background: #7d4a3a;
    margin-top: 8px;
  }

  .quote-meta-table {
    display: grid;
    grid-template-columns: auto auto auto;
    row-gap: 7px;
    column-gap: 4px;
    font-size: 12.5px;
    color: #333;
    align-content: start;
  }

  .meta-label {
    font-weight: 600;
    color: #222;
    white-space: nowrap;
  }

  .meta-colon { color: #555; padding: 0 2px; }

  .meta-value {
    color: #444;
    font-weight: 400;
    white-space: nowrap;
  }

  /* ── BILL TO / PROJECT ── */
  .bill-project-row {
    display: flex;
    gap: 0;
    padding: 28px 40px;
    border-bottom: 1px solid #ddd8d0;
  }

  .bill-box, .project-box {
    flex: 1;
  }

  .bill-box {
    padding-right: 30px;
    ${projectHtml ? 'border-right: 1px solid #ddd8d0;' : ''}
  }

  .project-box {
    padding-left: 36px;
  }

  .section-icon-label {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .icon-box {
    width: 34px;
    height: 34px;
    background: #7d4a3a;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-box svg { width: 16px; height: 16px; fill: #fff; }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2.5px;
    color: #7d4a3a;
    text-transform: uppercase;
  }

  .bill-company {
    font-size: 14.5px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .bill-person {
    font-size: 12.5px;
    color: #444;
    margin-bottom: 10px;
  }

  .bill-detail {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: #555;
    margin-bottom: 5px;
  }

  .bill-detail svg { width: 12px; height: 12px; flex-shrink: 0; }

  .project-name {
    font-size: 14.5px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 5px;
  }

  .project-type {
    font-size: 12.5px;
    color: #444;
    margin-bottom: 8px;
  }

  .project-detail {
    font-size: 12.5px;
    color: #555;
    margin-bottom: 5px;
  }

  .project-detail span { font-weight: 600; color: #333; }

  /* ── ITEMS TABLE ── */
  .table-section {
    padding: 0;
  }

  table.items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
  }

  .items-table thead tr {
    background: #7d4a3a;
  }

  .items-table thead th {
    color: #fff;
    font-weight: 700;
    letter-spacing: 1.5px;
    font-size: 10.5px;
    padding: 13px 18px;
    text-align: left;
    text-transform: uppercase;
  }

  .items-table thead th:first-child { padding-left: 24px; width: 80px; }
  .items-table thead th:last-child { text-align: right; padding-right: 24px; }
  .items-table thead th:nth-child(3) { text-align: center; width: 70px; }
  .items-table thead th:nth-child(4) { text-align: right; width: 120px; }

  .items-table tbody tr {
    border-bottom: 1px solid #e5e0d8;
  }

  .items-table tbody tr:nth-child(even) {
    background: #f5f1eb;
  }
  .items-table tbody tr:nth-child(odd) {
    background: #faf8f5;
  }

  .items-table tbody td {
    padding: 14px 18px;
    color: #333;
  }

  .items-table tbody td:first-child { padding-left: 24px; color: #555; font-weight: 500; }
  .items-table tbody td:last-child { text-align: right; padding-right: 24px; font-weight: 500; }
  .items-table tbody td:nth-child(3) { text-align: center; }
  .items-table tbody td:nth-child(4) { text-align: right; }

  /* Totals rows */
  .items-table .total-row td {
    background: #faf8f5;
    border-top: none;
    border-bottom: 1px solid #e5e0d8;
  }

  .items-table .total-row td.total-label {
    text-align: right;
    font-weight: 600;
    font-size: 12px;
    color: #333;
    padding-right: 18px;
    padding-left: 24px;
  }

  .items-table .total-row td.total-value {
    text-align: right;
    font-weight: 600;
    font-size: 13px;
    color: #222;
    padding-right: 24px;
    white-space: nowrap;
  }

  .items-table .grand-total-row td {
    background: #7d4a3a;
    padding: 15px 24px;
  }

  .items-table .grand-total-row td.gt-label {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #fff;
    text-transform: uppercase;
    text-align: right;
    padding-right: 18px;
  }

  .items-table .grand-total-row td.gt-value {
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    text-align: right;
    white-space: nowrap;
  }

  /* Notes + totals layout */
  .notes-totals-row {
    display: flex;
    align-items: stretch;
    border-top: 1px solid #e5e0d8;
  }

  .notes-col {
    flex: 1.15;
    padding: 22px 28px 22px 24px;
    border-right: 1px solid #e5e0d8;
  }

  .totals-col {
    flex: 0.85;
  }

  .notes-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .notes-icon {
    width: 30px;
    height: 30px;
    background: #7d4a3a;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notes-icon svg { width: 14px; height: 14px; fill: #fff; }

  .notes-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2.5px;
    color: #7d4a3a;
    text-transform: uppercase;
  }

  .notes-list {
    list-style: disc;
    padding-left: 16px;
  }

  .notes-list li {
    font-size: 11.5px;
    color: #444;
    line-height: 1.7;
  }

  /* ── BOTTOM SECTION ── */
  .bottom-row {
    display: flex;
    gap: 0;
    padding: 26px 24px;
    border-top: 1px solid #ddd8d0;
    background: #faf8f5;
  }

  .terms-col {
    flex: 1.1;
    padding-right: 24px;
    border-right: 1px solid #ddd8d0;
  }

  .bank-col {
    flex: 1.1;
    padding: 0 24px;
    border-right: 1px solid #ddd8d0;
  }

  .qr-col {
    flex: 0.6;
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .bottom-section-title {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 12px;
  }

  .bottom-icon {
    width: 28px;
    height: 28px;
    background: #7d4a3a;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bottom-icon svg { width: 13px; height: 13px; fill: #fff; }

  .bottom-section-title span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2.5px;
    color: #7d4a3a;
    text-transform: uppercase;
  }

  .terms-list {
    list-style: none;
    counter-reset: term-counter;
  }

  .terms-list li {
    counter-increment: term-counter;
    font-size: 11px;
    color: #444;
    line-height: 1.75;
    padding-left: 18px;
    position: relative;
  }

  .terms-list li::before {
    content: counter(term-counter) ".";
    position: absolute;
    left: 0;
    color: #666;
    font-weight: 600;
  }

  .bank-row {
    display: flex;
    gap: 4px;
    font-size: 11px;
    color: #444;
    margin-bottom: 5px;
    line-height: 1.6;
  }

  .bank-key {
    min-width: 95px;
    font-weight: 600;
    color: #333;
    flex-shrink: 0;
  }

  .bank-colon {
    color: #888;
    margin: 0 2px;
  }

  .bank-val { color: #444; }

  .qr-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #7d4a3a;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .qr-placeholder {
    width: 90px;
    height: 90px;
    border: 2px solid #7d4a3a;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    position: relative;
    overflow: hidden;
  }

  .qr-upi {
    font-size: 9px;
    color: #666;
    text-align: center;
    margin-top: 7px;
    font-weight: 500;
  }

  /* ── FOOTER / SIGNATURE ── */
  .footer-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 60px;
    padding: 24px 40px;
    border-top: 1px solid #ddd8d0;
    background: #faf8f5;
  }

  .stamp-area {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stamp-circle {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 2.5px solid #7d4a3a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    background: #fff;
    overflow: hidden;
  }

  .stamp-circle img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .stamp-inner-text-top {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 3px;
    color: #7d4a3a;
    text-transform: uppercase;
    position: absolute;
    top: 14px;
    width: 100%;
    text-align: center;
  }

  .stamp-inner-text-bottom {
    font-size: 6.5px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #7d4a3a;
    text-transform: uppercase;
    position: absolute;
    bottom: 14px;
    width: 100%;
    text-align: center;
  }

  .stamp-triangle {
    width: 0;
    height: 0;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-bottom: 30px solid #7d4a3a;
    margin-top: 8px;
  }

  .signature-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .sig-for {
    font-size: 12px;
    font-weight: 600;
    color: #333;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .sig-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 36px;
    color: #333;
    font-style: italic;
    line-height: 1;
    margin-bottom: 2px;
  }

  .sig-image {
    height: 40px;
    object-fit: contain;
    margin-bottom: 2px;
  }

  .sig-underline {
    width: 120px;
    height: 1px;
    background: #888;
    margin-bottom: 4px;
  }

  .sig-title {
    font-size: 10.5px;
    color: #666;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  /* ── FINAL FOOTER ── */
  .final-footer {
    background: #7d4a3a;
    text-align: center;
    padding: 13px 0;
    letter-spacing: 5px;
    font-size: 9.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    text-transform: uppercase;
  }

  .final-footer .dash { margin: 0 12px; color: rgba(255,255,255,0.5); }

  canvas#qrCanvas { display: block; }

  /* Avoid page breaks inside rows */
  tr { page-break-inside: avoid; }
  .bottom-row, .notes-totals-row, .footer-row, .final-footer { page-break-inside: avoid; }

</style>
</head>
<body>
<div class="page">

  <!-- ══ HEADER ══ -->
  <div class="header">
    <div class="logo-area">
      <!-- Triangle logo mark -->
      <div class="logo-mark">
        ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" style="width:100%; height:100%; object-fit:contain; " />` : `
        <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <polygon points="40,4 76,72 4,72" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="3"/>
          <polygon points="40,16 66,64 14,64" fill="rgba(190,200,210,0.55)"/>
          <text x="40" y="78" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="8" font-weight="700" letter-spacing="3" fill="rgba(255,255,255,0.7)">STUDIO</text>
        </svg>
        `}
      </div>
      <div class="logo-text-block">
        <div class="logo-studio-name">${data.websiteName || 'GABHA STUDIO'}</div>
        <div class="logo-tagline">CONTEMPORARY ART STUDIO</div>
      </div>
    </div>

    <div class="header-contact">
      <div class="contact-row">
        <div class="icon">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
            <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 8 4a1.5 1.5 0 0 1 0 3.5z" fill="rgba(255,255,255,0.8)"/>
          </svg>
        </div>
        123 Creative Avenue, Mumbai, Maharashtra 400001
      </div>
      <div class="contact-row">
        <div class="icon">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
            <path d="M3 2h2.5l1 3-1.5 1.5A9 9 0 0 0 8.5 10L10 8.5l3 1V12a1 1 0 0 1-1 1C5.4 13 2 9.6 2 5a1 1 0 0 1 1-3z" fill="rgba(255,255,255,0.8)"/>
          </svg>
        </div>
        +91 9876543210
      </div>
      <div class="contact-row">
        <div class="icon">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
            <rect x="2" y="4" width="12" height="9" rx="1" stroke="rgba(255,255,255,0.8)" stroke-width="1.3" fill="none"/>
            <path d="M2 5l6 5 6-5" stroke="rgba(255,255,255,0.8)" stroke-width="1.3"/>
          </svg>
        </div>
        hello@gabhastudio.com
      </div>
    </div>
  </div>

  <!-- ══ QUOTATION TITLE + META ══ -->
  <div class="quote-meta-section">
    <div>
      <div class="quotation-title">${documentType}</div>
      <div class="quotation-title-underline"></div>
      
      <!-- Show "PAID" badge for final invoice -->
      ${documentType === 'FINAL SETTLEMENT INVOICE' ? `
        <div style="margin-top: 10px; background: #2E7D32; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; display: inline-block;">PAID</div>
      ` : ''}
    </div>
    <div class="quote-meta-table">
      <span class="meta-label">${documentNoLabel}</span>
      <span class="meta-colon">:</span>
      <span class="meta-value">${data.documentNo || '-'}</span>

      <span class="meta-label">Date</span>
      <span class="meta-colon">:</span>
      <span class="meta-value">${data.date || '-'}</span>

      ${data.validUntil ? `
      <span class="meta-label">Valid Until</span>
      <span class="meta-colon">:</span>
      <span class="meta-value">${data.validUntil}</span>
      ` : ''}

      <span class="meta-label">Prepared By</span>
      <span class="meta-colon">:</span>
      <span class="meta-value">${data.preparedBy || 'Gabha Studio'}</span>
    </div>
  </div>

  <!-- ══ BILL TO + PROJECT DETAILS ══ -->
  ${customerHtml || projectHtml ? `
  <div class="bill-project-row">
    ${customerHtml}
    ${projectHtml}
  </div>
  ` : ''}

  <!-- ══ ITEMS TABLE ══ -->
  <div class="table-section">
    <table class="items-table">
      <thead>
        <tr>
          <th>SR. NO.</th>
          <th>DESCRIPTION</th>
          <th>QTY</th>
          <th>RATE (₹)</th>
          <th>AMOUNT (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Notes + Subtotal/GST -->
    <div class="notes-totals-row">
      <div class="notes-col">
        <div class="notes-header">
          <div class="notes-icon">
            <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="2" width="10" height="13" rx="1.5" fill="none" stroke="white" stroke-width="1.3"/>
              <line x1="5.5" y1="6" x2="10.5" y2="6" stroke="white" stroke-width="1.2"/>
              <line x1="5.5" y1="8.5" x2="10.5" y2="8.5" stroke="white" stroke-width="1.2"/>
              <line x1="5.5" y1="11" x2="8.5" y2="11" stroke="white" stroke-width="1.2"/>
            </svg>
          </div>
          <div class="notes-title">Notes</div>
        </div>
        <ul class="notes-list">
          ${notesHtml}
        </ul>
      </div>

      <div class="totals-col">
        <table class="items-table">
          <tbody>
            <tr class="total-row">
              <td class="total-label" colspan="1" style="padding-top:12px; padding-bottom:8px;">SUBTOTAL</td>
              <td class="total-value" style="padding-top:12px; padding-bottom:8px; width:160px;">₹ ${fmt(data.subTotal)}</td>
            </tr>
            ${data.discount ? `
            <tr class="total-row">
              <td class="total-label" style="padding-top:8px; padding-bottom:8px;">DISCOUNT</td>
              <td class="total-value" style="padding-top:8px; padding-bottom:8px; color: #c2410c;">- ₹ ${fmt(data.discount)}</td>
            </tr>
            ` : ''}
            ${data.gstEnabled || data.gstAmount > 0 ? `
            <tr class="total-row">
              <td class="total-label" style="padding-top:8px; padding-bottom:8px;">GST (${data.gstPercentage}%)</td>
              <td class="total-value" style="padding-top:8px; padding-bottom:8px;">₹ ${fmt(data.gstAmount)}</td>
            </tr>
            ` : ''}
            ${data.shipping ? `
            <tr class="total-row">
              <td class="total-label" style="padding-top:8px; padding-bottom:8px;">SHIPPING</td>
              <td class="total-value" style="padding-top:8px; padding-bottom:8px;">₹ ${fmt(data.shipping)}</td>
            </tr>
            ` : ''}
            <tr class="grand-total-row">
              <td class="gt-label">GRAND TOTAL</td>
              <td class="gt-value">₹ ${fmt(data.total)}</td>
            </tr>
            
            ${data.paidAmount !== undefined ? `
            <tr class="total-row">
              <td class="total-label" colspan="1" style="padding-top:14px; padding-bottom:14px; color:#1a1a1a;">TOTAL PAID SO FAR</td>
              <td class="total-value" style="padding-top:14px; padding-bottom:14px; width:160px;">₹ ${fmt(data.paidAmount)}</td>
            </tr>
            <tr class="grand-total-row" style="background:#1a1a1a;">
              <td class="gt-label" style="font-size:12px;">REMAINING BALANCE</td>
              <td class="gt-value" style="font-size:14px;">₹ ${fmt(Math.max(0, data.total - data.paidAmount))}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ══ TERMS + BANK + QR ══ -->
  <div class="bottom-row">
    <!-- Terms & Conditions -->
    <div class="terms-col">
      <div class="bottom-section-title">
        <div class="bottom-icon">
          <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2L3 4.5v4C3 11.5 5.2 14 8 15c2.8-1 5-3.5 5-6.5v-4L8 2z" fill="none" stroke="white" stroke-width="1.3"/>
            <path d="M5.5 8.5l1.5 1.5 3-3" stroke="white" stroke-width="1.3" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
        <span>Terms &amp; Conditions</span>
      </div>
      <ol class="terms-list">
        ${termsHtml}
      </ol>
    </div>

    <!-- Bank Details -->
    <div class="bank-col">
      <div class="bottom-section-title">
        <div class="bottom-icon">
          <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="13" width="12" height="1.5" fill="white"/>
            <rect x="3" y="7" width="1.8" height="6" fill="white"/>
            <rect x="7.1" y="7" width="1.8" height="6" fill="white"/>
            <rect x="11.2" y="7" width="1.8" height="6" fill="white"/>
            <polygon points="8,2 2,6 14,6" fill="white"/>
          </svg>
        </div>
        <span>Bank Details</span>
      </div>
      <div class="bank-row"><span class="bank-key">Account Name</span><span class="bank-colon">:</span><span class="bank-val">${data.bankAccountName || 'Gabha Studio'}</span></div>
      <div class="bank-row"><span class="bank-key">Bank Name</span><span class="bank-colon">:</span><span class="bank-val">${data.bankName || 'HDFC Bank'}</span></div>
      <div class="bank-row"><span class="bank-key">Account No.</span><span class="bank-colon">:</span><span class="bank-val">${data.bankAccountNumber || '1234 5678 9012'}</span></div>
      <div class="bank-row"><span class="bank-key">IFSC Code</span><span class="bank-colon">:</span><span class="bank-val">${data.bankIfscCode || 'HDFC0001234'}</span></div>
      <div class="bank-row"><span class="bank-key">UPI ID</span><span class="bank-colon">:</span><span class="bank-val">${data.upiId || 'gabhastudio@hdfc'}</span></div>
      ${data.gstNumber ? `<div class="bank-row"><span class="bank-key">GSTIN</span><span class="bank-colon">:</span><span class="bank-val">${data.gstNumber}</span></div>` : ''}
    </div>

    <!-- QR Code -->
    <div class="qr-col">
      <div class="qr-label">Scan to Pay</div>
      <div class="qr-placeholder">
        ${data.upiQrUrl ? `
          <img src="${data.upiQrUrl}" alt="UPI QR Code" style="width:100%; height:100%; object-fit:contain;" />
        ` : `
          <canvas id="qrCanvas" width="86" height="86"></canvas>
        `}
      </div>
      <div class="qr-upi">UPI ID: ${data.upiId || 'gabhastudio@hdfc'}</div>
    </div>
  </div>

  <!-- ══ SIGNATURE ══ -->
  <div class="footer-row">
    <!-- Stamp -->
    <div class="stamp-area">
      ${data.stampUrl ? `
        <div class="stamp-circle" style="border:none;">
          <img src="${data.stampUrl}" alt="Stamp" />
        </div>
      ` : `
      <div class="stamp-circle">
        <div class="stamp-inner-text-top">GABHA STUDIO</div>
        <div class="stamp-triangle"></div>
        <div class="stamp-inner-text-bottom">ART INSTALLATIONS</div>
      </div>
      `}
    </div>

    <!-- Signature -->
    <div class="signature-area">
      <div class="sig-for">For ${data.websiteName || 'Gabha Studio'}</div>
      ${data.signatureUrl ? `
        <img src="${data.signatureUrl}" class="sig-image" alt="Signature" />
      ` : `
        <div class="sig-name">Gabha</div>
      `}
      <div class="sig-underline"></div>
      <div class="sig-title">Authorized Signatory</div>
    </div>
  </div>

  <!-- ══ FINAL FOOTER ══ -->
  <div class="final-footer">
    <span class="dash">——</span>
    CREATING STORIES THROUGH ART
    <span class="dash">——</span>
  </div>

</div>

<script>
// Draw a realistic-looking QR code pattern on canvas
(function() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 86;
  const modules = 21;
  const cellSize = size / modules;

  function seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }
  const rand = seededRandom(42);

  const matrix = Array.from({length: modules}, () => Array(modules).fill(false));

  function addFinder(r, c) {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      matrix[r+i][c+j] = (i===0||i===6||j===0||j===6||(i>=2&&i<=4&&j>=2&&j<=4));
    }
  }
  addFinder(0, 0);
  addFinder(0, modules-7);
  addFinder(modules-7, 0);

  for (let i = 8; i < modules-8; i++) {
    matrix[6][i] = (i % 2 === 0);
    matrix[i][6] = (i % 2 === 0);
  }

  matrix[modules-8][8] = true;

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const inFinder = (r < 8 && c < 8) || (r < 8 && c >= modules-8) || (r >= modules-8 && c < 8);
      const inTiming = (r === 6 || c === 6);
      if (!inFinder && !inTiming) {
        if (!matrix[r][c]) matrix[r][c] = rand() > 0.5;
      }
    }
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (matrix[r][c]) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.3, cellSize - 0.3);
      }
    }
  }
})();
</script>
</body>
</html>`;
}

module.exports = { generatePDFHTML };
