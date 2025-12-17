
export interface PaymentData {
    tx_ref: string;
    amount: string;
    currency: string;
    redirect_url: string;
    payment_options: string;
    customer: {
        email: string;
        phonenumber?: string;
        name: string;
    };
    customizations: {
        title: string;
        description: string;
        logo: string;
    };
    meta?: Record<string, any>;
}

export async function initializePayment(data: PaymentData) {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment initialization failed');
    }

    return response.json();
}

export async function verifyTransaction(transactionId: string) {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Transaction verification failed');
    }

    return response.json();
}
