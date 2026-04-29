export const transferEmailTemplate = (data) => {
  const {
    firstName,
    amount,
    recipientName,
    recipientBank,
    refId,
    balance,
    narration,
  } = data;

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
            
            <tr>
              <td style="background-color: #2e7d32; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Transaction Receipt</h1>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 16px; color: #555;">Hello ${firstName},</p>
                <p style="font-size: 16px; color: #555;">Your transfer was successful. Here are the details of your transaction:</p>
                
                <table width="100%" style="margin-top: 20px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; color: #888;">Amount</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #2e7d32;">₦${Number(amount).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; color: #888;">Recipient</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${recipientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; color: #888;">Bank</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${recipientBank}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; color: #888;">Reference ID</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${refId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; color: #888;">Narration</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${narration || "N/A"}</td>
                  </tr>
                </table>

                <div style="margin-top: 30px; padding: 15px; background-color: #f1f8e9; border-radius: 5px; text-align: center;">
                  <span style="color: #555; font-size: 14px;">Your New Balance:</span>
                  <div style="font-size: 20px; font-weight: bold; color: #1b5e20;">₦${Number(balance).toLocaleString()}</div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px; text-align: center; font-size: 12px; color: #999; background-color: #fafafa;">
                <p>If you did not authorize this transaction, please contact us immediately.</p>
                <p>© 2026 IZI Bank. Safe. Fast. Reliable.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
