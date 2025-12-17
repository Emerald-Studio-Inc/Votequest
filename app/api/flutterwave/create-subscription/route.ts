import { NextRequest, NextResponse } from 'next/server';
import { initializePayment } from '@/lib/flutterwave';
import { supabaseAdmin } from '@/lib/server-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, planId, amount, userId } = body;

    if (!organizationId || !planId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get organization details
    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .select('*, users!inner(email, full_name, id)')
      .eq('id', organizationId)
      .single();

    if (error || !org) {
      console.error('Org fetch error:', error);
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const txRef = `sub_${organizationId}_${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const paymentData = {
      tx_ref: txRef,
      amount: amount.toString(),
      currency: 'NGN',
      redirect_url: `${appUrl}/payment-success?type=subscription&orgId=${organizationId}&planId=${planId}`,
      payment_options: 'card,banktransfer',
      customer: {
        email: org.users?.email || 'customer@votequest.com',
        name: org.users?.full_name || 'Organization Admin',
      },
      customizations: {
        title: `VoteQuest ${planId} Subscription`,
        description: `Upgrade to ${planId} plan`,
        logo: `${appUrl}/logo.png`,
      },
      meta: {
        organization_id: organizationId,
        plan_id: planId,
        user_id: org.users?.id
      }
    };

    const response = await initializePayment(paymentData);

    return NextResponse.json({
      message: 'Payment initialized',
      paymentLink: response.data.link
    }, { status: 200 });

  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
