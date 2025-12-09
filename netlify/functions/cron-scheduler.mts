import { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {

    // The URL of your Next.js API route
    // In production, this env var is set automatically by Netlify or you set it manually
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.netlify.app';
    const cronSecret = process.env.CRON_SECRET;

    console.log("[CRON] Triggering scheduled update...");

    try {
        const response = await fetch(`${appUrl}/api/schedule/update-proposals`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cronSecret}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CRON] Failed to update: ${response.status} ${errorText}`);
            return new Response("Failed", { status: 500 });
        }

        const data = await response.json();
        console.log("[CRON] Update successful:", data);
        return new Response("Success", { status: 200 });

    } catch (error) {
        console.error("[CRON] Error triggering update:", error);
        return new Response("Error", { status: 500 });
    }
};

// Schedule to run every 10 minutes
export const config: Config = {
    schedule: "*/10 * * * *"
};
