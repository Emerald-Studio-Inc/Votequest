import { redirect } from 'next/navigation';

export default function ProposalRedirect({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { ref?: string }
}) {
    // Redirect to the main page with proposal ID and referral code as query parameters
    // This allows the single-page app to handle the routing
    const targetUrl = searchParams.ref
        ? `/?proposal=${params.id}&ref=${searchParams.ref}`
        : `/?proposal=${params.id}`;

    redirect(targetUrl);
}
