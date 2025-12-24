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

    try {
      const response = await fetch("https://api.a4f.co/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cleanKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: preferredModelId,
          prompt: prompt,
          n: count,
          size: "1024x1024" // Default standard size
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`A4F API Error (${response.status}):`, errorText);
        
        // Try to parse friendly error message
        let friendlyMessage = `Provider Error (${response.status})`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error && errorJson.error.message) {
                friendlyMessage = errorJson.error.message;
            } else if (errorJson.message) {
                friendlyMessage = errorJson.message;
            }
        } catch (e) {
            // Use raw text if not JSON
            friendlyMessage += `: ${errorText.slice(0, 100)}`;
        }

        if (response.status === 401) {
             return res.status(401).json({ message: "A4F Authorization Failed: Please check your API Key and Model permissions." });
        }
        
        // Return 429 for rate limits, or 500/400 for others, but pass the friendly message
        const status = response.status === 429 ? 429 : 500;
        return res.status(status).json({ message: friendlyMessage });
      }

      const data = await response.json();
      console.log("A4F Response received:", JSON.stringify(data).slice(0, 200));

      // 6. Process Output
      const images = data.data.map((item: any, index: number) => {
          return {
              id: `img-${Date.now()}-${index}`,
              url: item.url, // A4F returns URLs
              prompt: prompt
          };
      });

      console.log(`Successfully generated ${images.length} images.`);
      return res.status(200).json({ images });

    } catch (apiError: any) {
       console.error("API Call Failed:", apiError);
       throw apiError;
    }

  } catch (error: any) {
    console.error("Backend Handler Fatal Error:", error);
    let message = error.message || 'Internal Server Error';
    return res.status(500).json({ message });
  }
}
