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
            amount: amount,
            currency: 'USD',
            lifetime: 30, // 30 minutes
            fee_paid_by_payer: 1, // 1 = payer pays fee
            under_paid_coverage: 2.5,
            to_currency: 'USDT',
            auto_withdrawal: false,
            mixed_payment: true,
            return_url: returnUrl || "https://example.com/success",
            order_id: orderId,
            thanks_message: "Thank you for your purchase!",
            description: description || `Order #${orderId}`,
            email: email,
            sandbox: false // Set to true for testing if needed
        };

        const response = await fetch('https://api.oxapay.com/v1/payment/invoice', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'merchant_api_key': API_KEY 
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
