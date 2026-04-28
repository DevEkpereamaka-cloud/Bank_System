export const welcomeEmailTemplate = (firstName) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f6;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            
            <tr>
              <td style="background-color: #4CAF50; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">IZI Bank</h1>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 40px 30px; color: #333333;">
                <h2 style="margin-top: 0; color: #4CAF50;">Welcome aboard, ${firstName}! 🎉</h2>
                <p style="font-size: 16px; line-height: 1.6;">
                  We are absolutely thrilled to have you join <strong>IZI Bank</strong>. Your account has been successfully created, and your digital vault is ready for use.
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  With IZI Bank, you can make lightning-fast transfers, check your balance, and manage your money with top-tier security.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Login to Your Account</a>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                  If you have any questions, our support team is here for you 24/7.
                </p>
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #eeeeee; padding: 20px; text-align: center; font-size: 14px; color: #777777;">
                <p style="margin: 0;">© 2026 IZI Bank. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">Enugu, Nigeria</p>
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
