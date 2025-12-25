// @ts-ignore
import { Buffer } from "buffer";

export default async function handler(req: any, res: any) {
  // 1. Handle CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 2. Robust Body Parsing
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Failed to parse request body:", e);
      }
    }
    const { prompt, numberOfImages = 1 } = body || {};

    console.log("Received Prompt:", prompt);

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    let key = process.env.A4F_API_KEY;
    const maskedKey = key ? `${String(key).slice(0, 6)}...` : null;
    console.log("A4F key present:", Boolean(key), "key:", maskedKey);
    if (!key) {
      console.warn("Environment check failed: A4F_API_KEY is undefined. Falling back to hardcoded backup key.");
      // FALLBACK for "Fixed Proper" requirement: Use the key provided by user if env var fails
      key = "ddc-a4f-07842c4bb9ae4099b39833a26a4acf46";
    }
    
    const cleanKey = key.trim();
    // Force specific model ID if env var is missing or empty, to ensure we use the working one
    const preferredModelId = (process.env.A4F_MODEL_ID && process.env.A4F_MODEL_ID.length > 0) 
        ? process.env.A4F_MODEL_ID 
        : "provider-4/imagen-3.5";

    // 5. Run generation (using A4F direct API)
    // Clamp to 4 to match provider rate limits
    const count = Math.min(Math.max(1, numberOfImages), 4);
    console.log(`Starting generation for ${count} image(s) using model ${preferredModelId}...`);
    console.log(`Request details: URL=https://api.a4f.co/v1/images/generations, Key=...${cleanKey.slice(-4)}`);

    // Helper to generate a single image (or batch if reliable, but parallel is better for variety)
    // We use parallel requests to ensure variety (different seeds) and avoid provider batch issues
    const generatePromise = async (idx: number) => {
        const randomSeed = Math.floor(Math.random() * 1000000000);
        // Slightly modify prompt with seed or just rely on API's randomness if n=1
        // Some providers ignore seed if n>1 in batch mode, so we force n=1 per request
        
        const response = await fetch("https://api.a4f.co/v1/images/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${cleanKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: preferredModelId,
                prompt: prompt,
                n: 1, // Force 1 per request for variety
                size: "1024x1024",
                seed: randomSeed // Send explicit random seed
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Error (${response.status}): ${text}`);
        }
        return response.json();
    };

    try {
        // Create an array of promises based on count
        const promises = Array.from({ length: count }, (_, i) => generatePromise(i));
        
        // Wait for all to complete
        const results = await Promise.all(promises);
        
        // Collect all images from all responses
        let allImages: any[] = [];
        results.forEach((data: any) => {
            if (data.data && Array.isArray(data.data)) {
                allImages = allImages.concat(data.data);
            }
        });

        console.log(`Successfully generated ${allImages.length} images via parallel requests.`);

        // 6. Process Output
        const images = allImages.map((item: any, index: number) => {
            return {
                id: `img-${Date.now()}-${index}`,
                url: item.url, 
                prompt: prompt
            };
        });

        return res.status(200).json({ images });

    } catch (apiError: any) {
        console.error("API Call Failed:", apiError);
        
        // Try to extract meaningful error message
        let errorMessage = apiError.message || "Failed to generate images";
        let status = 500;
        
        if (errorMessage.includes("401")) {
             status = 401;
             errorMessage = "A4F Authorization Failed: Please check your API Key and Model permissions.";
        } else if (errorMessage.includes("429")) {
             status = 429;
             // Rate limit hit
        }

        // Return clean JSON error
        return res.status(status).json({ message: errorMessage });
    }

  } catch (error: any) {
    console.error("Backend Handler Fatal Error:", error);
    let message = error.message || 'Internal Server Error';
    return res.status(500).json({ message });
  }
}
