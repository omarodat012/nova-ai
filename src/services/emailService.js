const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const emailJsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

export const isEmailJsConfigured = Object.values(emailJsConfig).every((value) => typeof value === 'string' && value.trim());

// Sends one message through the EmailJS template. The template is expected to use {{to_email}} as its "To" address
// and {{to_name}}, {{subject}} and {{message}} in its content (see .env.example).
async function sendOne({ email, name, subject, message }) {
  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: emailJsConfig.serviceId,
      template_id: emailJsConfig.templateId,
      user_id: emailJsConfig.publicKey,
      template_params: { to_email: email, to_name: name, subject, message },
    }),
  });
  if (!response.ok) throw new Error(`EmailJS ${response.status}: ${await response.text()}`);
}

// Emails every recipient one by one (EmailJS accepts a single address per request). `onProgress(sentSoFar)` fires
// after each attempt. Resolves to { sent, failed: [{ recipient, error }] }; it never throws for a single bad address.
export async function sendEmails(recipients, { subject, message }, onProgress, signal) {
  const failed = [];
  let done = 0;

  for (const recipient of recipients) {
    if (signal?.aborted) break;
    try {
      await sendOne({ email: recipient.email, name: recipient.fullName, subject, message });
    } catch (error) {
      failed.push({ recipient, error });
    }
    done += 1;
    onProgress?.(done);
  }

  return { sent: done - failed.length, failed, attempted: done };
}

export function gmailComposeUrl({ bcc, subject, body }) {
  const params = new URLSearchParams({ view: 'cm', fs: '1', bcc: bcc.join(','), su: subject, body });
  return `https://mail.google.com/mail/?${params}`;
}
