const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2022-09-01';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID required' });
        }

        if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
            return res.status(500).json({ message: 'Cashfree configuration missing' });
        }

        const response = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
                'x-api-version': CASHFREE_API_VERSION
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Check status
            if (data.order_status === 'PAID') {
                return res.status(200).json({ success: true, status: 'PAID', amount: data.order_amount });
            } else {
                return res.status(200).json({ success: false, status: data.order_status });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Failed to verify payment with Cashfree' });
        }

    } catch (error: any) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
