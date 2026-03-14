export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const escape = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DeClaw <onboard@de-claw.co>',
      to: ['info@kinglyclark.com'],
      subject: `New DeClaw request — Remove OpenClaw for ${name}`,
      html: `
        <p>A new request has come in through the DeClaw landing page.</p>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;margin-top:12px;">
          <tr>
            <td style="padding:6px 20px 6px 0;color:#666;font-weight:600;">Name</td>
            <td style="padding:6px 0;">${escape(name)}</td>
          </tr>
          <tr>
            <td style="padding:6px 20px 6px 0;color:#666;font-weight:600;">Email</td>
            <td style="padding:6px 0;"><a href="mailto:${escape(email)}">${escape(email)}</a></td>
          </tr>
        </table>
        <p style="margin-top:20px;color:#555;">They want OpenClaw removed from their machine for $5.</p>
      `,
    }),
  });

  if (response.ok) {
    return res.status(200).json({ success: true });
  }

  const data = await response.json().catch(() => ({}));
  return res.status(500).json({ error: data.message || 'Failed to send email' });
}
