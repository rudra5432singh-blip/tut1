const twilio = require('twilio');
require('dotenv').config();

// ─── Twilio Setup ──────────────────────────────────────────────────────────────
let client = null;
let twilioConfigured = false;

try {
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    twilioConfigured = true;
    console.log('[SMS] Twilio client initialized.');
  } else {
    console.log('[SMS] Twilio not configured — will use simulated SMS logs.');
  }
} catch (err) {
  console.error('[SMS] Failed to initialize Twilio:', err.message);
}

// ─── Message Builder ──────────────────────────────────────────────────────────
function buildMessage(name, complaint_id, summary) {
  return (
    `Hello ${name},\n\n` +
    `Your complaint has been registered successfully.\n\n` +
    `Complaint ID: ${complaint_id}\n\n` +
    `Issue:\n${summary}\n\n` +
    `Status:\nComplaint Received\n\n` +
    `You will receive updates as the issue progresses.\n` +
    `Thank you for helping improve the city.\n` +
    `– AI Civic Complaint Resolver`
  );
}

// ─── Simulated SMS (fallback) ─────────────────────────────────────────────────
function simulateSMS(phone_number, complaint_id, summary, name) {
  const message = buildMessage(name, complaint_id, summary);
  console.log('\n============================================================');
  console.log('[SIMULATED SMS] → To:', phone_number);
  console.log('------------------------------------------------------------');
  console.log(message);
  console.log('============================================================\n');
}

// ─── Main Export ──────────────────────────────────────────────────────────────
/**
 * Send an SMS/WhatsApp notification.
 * Falls back to console simulation when Twilio is not configured.
 *
 * @param {string} phone_number  Recipient number (with or without +)
 * @param {string} complaint_id  Complaint ID
 * @param {string} summary       Short issue summary
 * @param {string} name          Citizen name
 */
const sendNotification = async (phone_number, complaint_id, summary, name = 'Citizen') => {
  if (!phone_number) {
    console.log('[SMS] No phone number provided — skipping notification.');
    return;
  }

  const messageBody = buildMessage(name, complaint_id, summary);
  const formattedPhone = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;

  if (!twilioConfigured) {
    simulateSMS(formattedPhone, complaint_id, summary, name);
    return;
  }

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    console.log(`[SMS] Sent successfully → ${formattedPhone} | SID: ${message.sid}`);
    return message;
  } catch (error) {
    // Log error but do NOT crash the request — treat as simulated
    console.error('[SMS] Twilio send failed:', error.message);
    console.log('[SMS] Falling back to simulated SMS...');
    simulateSMS(formattedPhone, complaint_id, summary, name);
  }
};

module.exports = { sendNotification };
