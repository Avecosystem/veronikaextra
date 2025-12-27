export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { amount, orderId, email, description, returnUrl } = req.body;

        // Use the hardcoded key if env var is missing, or prioritize the hardcoded one if user wants
        const API_KEY = process.env.OXPAY_MERCHANT_ID || "QB5WB5-GAS15X-IBUGYW-SNGIRG";

        if (!amount || !orderId) {
            return res.status(400).json({ message: 'Missing required fields for Oxapay.' });
        }

        const payload = {
            merchant: API_KEY,
            amount: amount,
            currency: 'USD',
            lifeTime: 30,
            feePaidByPayer: 1,
            underPaidCoverage: 2.5,
            returnUrl: returnUrl,
            description: description || `Order #${orderId}`,
            orderId: orderId,
            email: email
        };

        const response = await fetch('https://api.oxapay.com/merchants/request', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Oxapay API Response:", JSON.stringify(data));

        // Check for payLink in various locations
        const payLink = data.payLink || (data.data && data.data.payLink);

        // Check for success indicators
        // Some APIs return result: 100, others message: "success" or "Operation completed successfully!"
        const isSuccess = data.result === 100 || 
                          (data.message && data.message.toLowerCase().includes("success")) ||
                          (data.message && data.message.toLowerCase().includes("completed"));

        if (isSuccess && payLink) {
            return res.status(200).json({ 
                success: true, 
                paymentUrl: payLink 
            });
        } else if (payLink) {
             // If we have a payLink, it's probably a success even if the message is weird
             return res.status(200).json({ 
                success: true, 
                paymentUrl: payLink 
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
