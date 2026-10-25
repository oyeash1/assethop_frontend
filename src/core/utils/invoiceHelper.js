// src/core/utils/invoiceHelper.js

export function printInvoice(booking, role = 'RENTER') {
  if (!booking) return;

  const isCompleted = booking.status === 'COMPLETED';
  const invoiceWindow = window.open('', '_blank');
  
  // Format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const invoiceDate = formatDate(new Date());
  const startDateFormatted = formatDate(booking.startDate);
  const endDateFormatted = formatDate(booking.endDate);
  const handoverDateFormatted = booking.handoverVerifiedAt ? formatDate(booking.handoverVerifiedAt) : 'N/A';
  const returnDateFormatted = booking.actualReturnDate ? formatDate(booking.actualReturnDate) : 'N/A';

  // Math formatting
  const formatCurrency = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  // Get pricing values
  const baseRent = booking.baseRentalFee || booking.pricing?.baseRent || 0;
  const userPlatform = booking.userPlatformFee || booking.pricing?.platformFee || 0;
  const userGst = booking.userGstFee || 0;
  const totalPlatformService = userPlatform + userGst;
  const deposit = booking.refundableDeposit || booking.pricing?.securityDeposit || 0;
  const totalPaid = booking.totalUserPayable || booking.totals?.userTotalPaid || 0;
  const lateFee = booking.lateFeeCharge || 0;
  
  const hostEarned = booking.hostNetPayout || booking.totals?.hostEarned || 0;
  const hostCommission = booking.hostCommissionFee || 0;
  const hostGst = booking.hostGstFee || 0;
  const hostTotalCommission = hostCommission + hostGst;

  let title = 'Booking Invoice';
  let subtitle = 'Payment Confirmation & Receipt';
  let billingSection = '';
  let invoiceTable = '';
  let footerSection = '';

  if (role === 'RENTER') {
    title = isCompleted ? 'Final Settlement Invoice' : 'Rental Booking Invoice';
    subtitle = isCompleted ? 'Rental Completed & Refund Settled' : 'Payment Confirmation & Receipt';
    
    billingSection = `
      <div class="info-block">
        <h3>Billed To (Renter)</h3>
        <p><strong>Name:</strong> ${booking.userId?.name || 'Customer'}</p>
        <p><strong>Email:</strong> ${booking.userId?.email || 'N/A'}</p>
        <p><strong>Status:</strong> KYC Verified</p>
      </div>
      <div class="info-block">
        <h3>Asset Provider (Host)</h3>
        <p><strong>Name:</strong> ${booking.hostId?.name || 'Owner'}</p>
        <p><strong>Item Location:</strong> Mumbai, IN</p>
      </div>
    `;

    const finalCost = totalPaid - deposit + lateFee;

    invoiceTable = `
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="right">Daily Rate</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${booking.listingId?.title || 'Rental Gear'}</strong><br/>
              <span class="subtext">Category: ${booking.listingId?.category || 'N/A'} | Duration: ${startDateFormatted} to ${endDateFormatted}</span>
            </td>
            <td class="right">${formatCurrency(booking.listingId?.dailyRent)}</td>
            <td class="right">${formatCurrency(baseRent)}</td>
          </tr>
          <tr>
            <td>
              <strong>Platform & Service Fee</strong><br/>
              <span class="subtext">Includes 18% GST (Renter Side Charges)</span>
            </td>
            <td class="right">-</td>
            <td class="right">${formatCurrency(totalPlatformService)}</td>
          </tr>
          <tr>
            <td>
              <strong>Security Deposit (Refundable)</strong><br/>
              <span class="subtext">Held in secure escrow during rental duration</span>
            </td>
            <td class="right">-</td>
            <td class="right">${formatCurrency(deposit)}</td>
          </tr>
          
          <!-- Summary Totals -->
          <tr class="total-row first">
            <td colspan="2">Total Amount Paid (Pre-Authorised)</td>
            <td class="right highlight">${formatCurrency(totalPaid)}</td>
          </tr>

          ${isCompleted ? `
            <tr>
              <td>
                <strong>Security Deposit Refunded</strong><br/>
                <span class="subtext">Automatically released back on return verification</span>
              </td>
              <td class="right">-</td>
              <td class="right text-green">-${formatCurrency(deposit)}</td>
            </tr>
            ${lateFee > 0 ? `
              <tr>
                <td>
                  <strong>Late Return Penalty</strong><br/>
                  <span class="subtext">Accumulated fee at penalty rate for overdue duration</span>
                </td>
                <td class="right">-</td>
                <td class="right text-red">${formatCurrency(lateFee)}</td>
              </tr>
            ` : ''}
            <tr class="total-row final">
              <td colspan="2">Net Final Cost Incurred</td>
              <td class="right highlight-accent">${formatCurrency(finalCost)}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    `;

    footerSection = isCompleted 
      ? `<p class="thank-you">Your security deposit of <strong>${formatCurrency(deposit)}</strong> has been successfully refunded. Thank you for renting with AssetHop!</p>`
      : `<p class="thank-you">Your payment has been successfully secured in escrow. Please present the Handover OTP code to the host upon item inspection.</p>`;

  } else {
    // HOST earnings invoice
    title = 'Host Settlement Statement';
    subtitle = 'Earning Split & Commission Invoice';
    
    billingSection = `
      <div class="info-block">
        <h3>Earning Payout Settled To</h3>
        <p><strong>Host Name:</strong> ${booking.hostId?.name || 'Owner'}</p>
        <p><strong>Email:</strong> ${booking.hostId?.email || 'N/A'}</p>
      </div>
      <div class="info-block">
        <h3>Customer Details (Renter)</h3>
        <p><strong>Renter Name:</strong> ${booking.userId?.name || 'Customer'}</p>
        <p><strong>Asset Rented:</strong> ${booking.listingId?.title || 'Gear'}</p>
      </div>
    `;

    const totalHostPayout = hostEarned + lateFee;

    invoiceTable = `
      <table>
        <thead>
          <tr>
            <th>Earning Breakdown</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Gross Rental Income</strong><br/>
              <span class="subtext">Calculated base fee for rented duration</span>
            </td>
            <td class="right">${formatCurrency(baseRent)}</td>
          </tr>
          <tr>
            <td>
              <strong>Platform Commission Deducted</strong><br/>
              <span class="subtext">Platform service commission charge (8% fee + 18% GST)</span>
            </td>
            <td class="right text-red">-${formatCurrency(hostTotalCommission)}</td>
          </tr>
          
          <!-- Base earnings subtotal -->
          <tr class="total-row first">
            <td>Base Earning Subtotal</td>
            <td class="right highlight">${formatCurrency(hostEarned)}</td>
          </tr>

          ${isCompleted ? `
            <tr>
              <td>
                <strong>Late Penalty Earning Share</strong><br/>
                <span class="subtext">Calculated compensation for delayed return</span>
              </td>
              <td class="right text-green">+${formatCurrency(lateFee)}</td>
            </tr>
            <tr class="total-row final">
              <td>Total Settled Host Earning</td>
              <td class="right highlight-accent">${formatCurrency(totalHostPayout)}</td>
            </tr>
          ` : `
            <tr class="total-row final">
              <td>Estimated Net Host Payout</td>
              <td class="right highlight-accent">${formatCurrency(hostEarned)}</td>
            </tr>
          `}
        </tbody>
      </table>
    `;

    footerSection = isCompleted
      ? `<p class="thank-you">This payout has been processed and initiated to your configured payout details. Please allow 1-3 business days for bank settlement.</p>`
      : `<p class="thank-you">Payout will be initiated instantly following return verification OTP check-in.</p>`;
  }

  // Construct the Full HTML Page for the Print window
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title} - Ref #${booking._id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          background-color: #ffffff;
          line-height: 1.5;
          -webkit-print-color-adjust: exact;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 24px;
          margin-bottom: 30px;
        }

        .logo {
          font-size: 28px;
          font-weight: 850;
          color: #1e293b;
          letter-spacing: -0.025em;
        }

        .logo span {
          color: #880808; /* AssetHop Red */
        }

        .invoice-details {
          text-align: right;
        }

        .invoice-details h1 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
          color: #880808;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .invoice-details p {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .info-grid {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .info-block h3 {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin: 0 0 10px 0;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
        }

        .info-block p {
          margin: 4px 0;
          font-size: 13px;
          color: #334155;
        }

        .info-block p strong {
          color: #1e293b;
        }

        .summary-block {
          background-color: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 30px;
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 20px;
        }

        .summary-block p {
          margin: 4px 0;
          font-size: 12px;
          color: #475569;
        }

        .summary-block p strong {
          color: #0f172a;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }

        th {
          background-color: #f8fafc;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          padding: 12px 16px;
          border-bottom: 2px solid #e2e8f0;
          text-align: left;
        }

        td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          color: #334155;
          vertical-align: top;
        }

        .subtext {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
          display: block;
        }

        .right {
          text-align: right;
        }

        .text-red {
          color: #dc2626;
          font-weight: 600;
        }

        .text-green {
          color: #16a34a;
          font-weight: 600;
        }

        .total-row td {
          font-weight: 700;
          font-size: 14px;
          color: #0f172a;
          border-bottom: none;
        }

        .total-row.first td {
          padding-top: 24px;
          border-top: 2px solid #e2e8f0;
        }

        .total-row.final td {
          font-size: 18px;
          font-weight: 800;
          padding-top: 16px;
          padding-bottom: 24px;
          border-bottom: 2px double #e2e8f0;
        }

        .highlight {
          color: #880808 !important;
        }

        .highlight-accent {
          color: #880808 !important;
          font-size: 20px !important;
        }

        .thank-you {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          margin-top: 60px;
          border-top: 1px dashed #e2e8f0;
          padding-top: 20px;
        }

        /* Action bar hidden in printing */
        .actions-bar {
          background-color: #0f172a;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .actions-bar p {
          color: #94a3b8;
          font-size: 12px;
          margin: 0;
          font-weight: 500;
        }

        .actions-bar button {
          background-color: #880808;
          color: white;
          border: none;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .actions-bar button:hover {
          background-color: #700707;
        }

        @media print {
          .actions-bar {
            display: none;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      
      <!-- Actions Bar -->
      <div class="actions-bar">
        <p>AssetHop Digital Receipt System — Click to Save or Print as PDF</p>
        <button onclick="window.print()">Download / Print PDF</button>
      </div>

      <!-- Invoice Header -->
      <div class="header">
        <div class="logo">Asset<span>Hop</span></div>
        <div class="invoice-details">
          <h1>${title}</h1>
          <p>Invoice No: INV-${booking._id.substring(booking._id.length - 8).toUpperCase()}</p>
          <p>Date Generated: ${invoiceDate}</p>
          <p>Booking ID: ${booking._id}</p>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="info-grid">
        ${billingSection}
      </div>

      <!-- Schedule/Trip Metrics Grid -->
      <div class="summary-block">
        <div>
          <p><strong>Scheduled Start:</strong> ${startDateFormatted}</p>
          <p><strong>Scheduled End:</strong> ${endDateFormatted}</p>
        </div>
        <div>
          <p><strong>Handover Verified:</strong> ${handoverDateFormatted}</p>
          <p><strong>Return Verification:</strong> ${returnDateFormatted}</p>
        </div>
      </div>

      <!-- Invoice Table -->
      ${invoiceTable}

      <!-- Footer message -->
      ${footerSection}

    </body>
    </html>
  `;

  invoiceWindow.document.write(htmlContent);
  invoiceWindow.document.close();
}
