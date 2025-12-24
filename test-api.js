
const key = "ddc-a4f-07842c4bb9ae4099b39833a26a4acf46";

async function testA4F() {
    console.log("Testing A4F API connection...");
    
    // Try listing models to verify key and endpoint
    try {
        const response = await fetch("https://api.a4f.co/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            }
        });
        
        console.log(`Models Endpoint Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log("Models list success (first 3):", data.data?.slice(0, 3));
        } else {
            console.log("Response:", await response.text());
        }
    } catch (e) {
        console.log("Models endpoint failed:", e.message);
    }

    // Try Image Generation Endpoint (OpenAI compatible)
    console.log("\nTesting Image Generation Endpoint...");
    try {
        const response = await fetch("https://api.a4f.co/v1/images/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "provider-4/imagen-3.5",
                prompt: "A cute baby sloth",
                n: 1,
                size: "1024x1024"
            })
        });
        
        console.log(`Image Endpoint Status: ${response.status}`);
        const text = await response.text();
        console.log("Response:", text);
    } catch (e) {
        console.log("Image endpoint failed:", e.message);
    }
}

testA4F();
