// @ts-ignore
import Bytez from "bytez.js";
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
    // 2. Robust Body Parsing (Handle stringified body on some serverless environments)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Failed to parse request body:", e);
      }
    }
    const { prompt, numberOfImages = 1 } = body || {};

    console.log("Received Prompt:", prompt); // Debug log

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const key = process.env.A4F_API_KEY;
    const maskedKey = key ? `${String(key).slice(0, 6)}...` : null;
    console.log("A4F key present:", Boolean(key), "key:", maskedKey);
    if (!key) {
      return res.status(500).json({ message: 'Missing A4F_API_KEY' });
    }

    // Robust SDK initialization to handle different module loading environments
    let sdk;
    try {
      // Try direct initialization
      sdk = new Bytez(key);
    } catch (e) {
      console.warn("Direct Bytez init failed, trying default export fallback...", e);
      // Fallback for CommonJS/ESM interop issues
      try {
        // @ts-ignore
        if (Bytez.default) {
          // @ts-ignore
          sdk = new Bytez.default(key);
        } else {
          throw e;
        }
      } catch (innerErr) {
        console.error("CRITICAL: Failed to initialize Bytez SDK:", innerErr);
        throw new Error("Server Configuration Error: Failed to initialize AI SDK.");
      }
    }

    const preferredModelId = process.env.A4F_MODEL_ID || "provider-4/imagen-3.5";
    const modelCandidates = [preferredModelId, "provider-4/imagen-3.5", "a4f/imagen-3.5"];
    let model: any = null;
    let selectedModelId = "";
    for (const candidate of modelCandidates) {
      try {
        console.log(`Loading model: ${candidate}`);
        model = sdk.model(candidate);
        selectedModelId = candidate;
        break;
      } catch (e) {
        console.warn(`Model load failed for ${candidate}`, e);
      }
    }
    if (!model) {
      throw new Error("Model initialization failed");
    }

    // 5. Run generation (Parallel if > 1 image requested)
    // Updated limit to 6 as requested
    const count = Math.min(Math.max(1, numberOfImages), 6);
    const promises = [];

    console.log(`Starting generation for ${count} image(s)...`);

    for (let i = 0; i < count; i++) {
      // model.run returns a promise that resolves to { output, error }
      promises.push(model.run(prompt));
    }

    const results = await Promise.all(promises);

    const images: any[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      const { error, output } = result;

      if (error) {
        console.error(`Generation ${index} failed:`, error);
        errors.push(typeof error === 'string' ? error : JSON.stringify(error));
      } else if (output) {
        console.log(`Generation ${index} success. Processing output type: ${typeof output}`);

        // 6. Process Output - Handle both URL strings and Binary Buffers
        try {
          let finalUrl = "";

          // Check if output is already a URL string (http/https)
          if (typeof output === 'string' && (output.startsWith('http://') || output.startsWith('https://'))) {
            finalUrl = output;
          } else {
            // Assume it's binary data (Buffer/ArrayBuffer) and convert to Base64
            const buffer = Buffer.isBuffer(output) ? output : Buffer.from(output);
            const base64Img = buffer.toString('base64');
            // Simple check to ensure we actually have data
            if (base64Img.length > 0) {
              finalUrl = `data:image/png;base64,${base64Img}`;
            } else {
              throw new Error("Empty image buffer returned.");
            }
          }

          if (finalUrl) {
            images.push({
              id: `img-${Date.now()}-${index}`,
              url: finalUrl,
              prompt: prompt,
            });
          }
        } catch (bufferError) {
          console.error(`Output processing failed for image ${index}:`, bufferError);
          errors.push("Failed to process image data.");
        }
      } else {
        console.error(`Generation ${index} returned no output and no error.`);
        errors.push("Model returned empty response.");
      }
    });

    // 7. Response Handling
    if (images.length === 0) {
      const firstError = errors[0] || "";
      if (typeof firstError === "string" && firstError.toLowerCase().includes("unauthorized")) {
        return res.status(401).json({ message: "Unauthorized: check A4F_API_KEY and model access" });
      }
      const errorMessage = errors.length > 0
        ? `Model Error: ${errors[0]}`
        : "Failed to generate image. The model returned no valid data.";
      console.error("All generations failed:", errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`Successfully generated ${images.length} images.`);
    return res.status(200).json({ images });

  } catch (error: any) {
    console.error("Backend Handler Fatal Error:", error);
    let message = error.message || 'Internal Server Error';
    return res.status(500).json({ message });
  }
}
