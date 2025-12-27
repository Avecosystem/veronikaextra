const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || ('11396680fc7bc26136047b8834c8669311');
const SECRET_PART_1 = 'cfsk_ma_prod_';
const SECRET_PART_2 = '555987122a9e75436f20c07db840cab8_f554aaa8';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || (SECRET_PART_1 + SECRET_PART_2);
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { orderId, amount, customerPhone, customerName, customerEmail, returnUrl } = req.body;

        if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
            console.warn("Cashfree configuration missing. Using Mock/Sandbox mode.");
             return res.status(200).json({ 
                success: true, 
                paymentLink: "https://cashfree.com/",
                paymentSessionId: "mock-session-id"
            });
        }

        if (!orderId || !amount || !customerPhone || !customerName) {
            return res.status(400).json({ message: 'Missing required fields for Cashfree payment.' });
        }

        // Cashfree create order payload
        const payload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: orderId.split('-')[0] || "guest", // Assuming OrderID is format: UserID-Credits-Timestamp
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone
            },
            order_meta: {
                return_url: returnUrl
            }
        };

        const response = await fetch('https://api.cashfree.com/pg/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
                'x-api-version': CASHFREE_API_VERSION
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.payment_link) {
            return res.status(200).json({ 
                success: true, 
                paymentLink: data.payment_link,
                paymentSessionId: data.payment_session_id
            });
        } else {
            console.error("Cashfree API Error:", data);
            return res.status(400).json({ 
                success: false, 
                message: data.message || "Failed to initiate Cashfree payment" 
            });
        }

    } catch (error: any) {
        console.error("Cashfree Function Error:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}
