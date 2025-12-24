const OXPAY_MERCHANT_ID = process.env.OXPAY_MERCHANT_ID;

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { amount, orderId, email, description, returnUrl } = req.body;

        if (!OXPAY_MERCHANT_ID) {
            return res.status(500).json({ message: 'Oxapay configuration missing' });
        }

        if (!amount || !orderId) {
            return res.status(400).json({ message: 'Missing required fields for Oxapay.' });
        }

        const payload = {
            merchant: OXPAY_MERCHANT_ID,
            amount: amount,
            currency: 'USD',
            lifeTime: 30, // 30 minutes
            feePaidByPayer: 0,
            underPaidCover: 0,
            returnUrl: returnUrl,
            description: description,
            orderId: orderId,
            email: email
        };

        const response = await fetch('https://api.oxapay.com/merchants/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.result === 100 && data.payLink) {
            return res.status(200).json({ 
                success: true, 
                paymentUrl: data.payLink 
            });
        } else {
            console.error("Oxapay API Error:", data);
            return res.status(400).json({ 
                success: false, 
                message: data.message || "Failed to create crypto invoice" 
            });
        }

    } catch (error: any) {
        console.error("Oxapay Function Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
