function getEmailVerificationTemplate(email, otp) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
      <h2 style="color: #4CAF50;">👋 Welcome to Blog App!</h2>
      <p>Thank you for signing up. To verify your email address${email}, please use the OTP below:</p>
      <p style="font-size: 18px; font-weight: bold; color: #000;">Your OTP: <span style="color: #4CAF50;">${otp}</span></p>
      <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <br />
      <p>Happy blogging!<br />— The Blog App Team</p>
    </div>
  `;
}

function getWelcomeBackTemplate(email) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f8; color: #333;">
      <h2 style="color: #4CAF50;">👋 Welcome back to Blog App!</h2>
      <p>Hi <strong>${email}</strong>,</p>
      <p>We're glad to see you again! You’ve successfully signed in to your account.</p>
      <p>If this was you, no further action is needed.</p>
      <p style="margin-top: 20px;">🔒 <strong>Security Tip:</strong> If you didn't sign in just now, please reset your password immediately or contact our support team.</p>
      <br />
      <p>Need help or have questions? We're here for you.</p>
      <p>Keep sharing your thoughts and inspiring others. ✍️</p>
      <br />
      <p>Happy blogging!<br />— The Blog App Team</p>
    </div>
  `;
}

module.exports = { getWelcomeBackTemplate, getEmailVerificationTemplate };
