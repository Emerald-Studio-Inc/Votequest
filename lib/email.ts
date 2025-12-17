
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
        // Real implementation if key exists
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                    from: 'VoteQuest <noreply@votequest.com>',
                    to,
                    subject,
                    html,
                    text
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Email] Provider Error:', error);
                throw new Error('Failed to send email via provider');
            }

            return { success: true };
        } catch (error) {
            console.error('[Email] Error:', error);
            // Fallback to console in dev?
            if (process.env.NODE_ENV === 'development') {
                logEmailPreview({ to, subject, html });
                return { success: true, preview: true };
            }
            throw error;
        }
    } else {
        // Development fallback
        logEmailPreview({ to, subject, html });
        return { success: true, preview: true };
    }
}

function logEmailPreview(email: Omit<EmailOptions, 'text'>) {
    console.log('\n📨 === EMAIL PREVIEW ===');
    console.log(`To: ${email.to}`);
    console.log(`Subject: ${email.subject}`);
    console.log('--- Body ---');
    console.log(email.html.replace(/<[^>]*>/g, '')); // Strip tags for preview
    console.log('======================\n');
}
