
// constants.ts
import { CreditPlan } from "./types";

export const API_BASE_URL: string = '/api'; // Mock API base URL

export const IMAGE_COST: number = 5; // Credits per image generation
export const INITIAL_CREDITS: number = 25; // Credits new users receive

export const CONTACT_EMAIL: string = 'infobabe09@gmail.com';
export const BRAND_NAME: string = 'VERONIKAextra';
export const APP_TAGLINE: string = 'Generate stunning AI visuals in seconds — powered by VERONIKAextra Images (Babe AI ). By Av ecosystem';
export const COPYRIGHT_YEAR: string = '2025';

export const UPI_ID: string = 'ankanbayen@oksbi';
export const UPI_QR_CODE_PATH: string = '/assets/upi.png'; // Path to static QR code image

export const FIXED_USD_TO_INR_RATE: number = 83; // Example fixed rate for conversion

export const CREDIT_PLANS: CreditPlan[] = [
  { id: 1, credits: 50, inrPrice: 149, usdPrice: parseFloat((149 / FIXED_USD_TO_INR_RATE).toFixed(2)) },
  { id: 2, credits: 100, inrPrice: 229, usdPrice: parseFloat((229 / FIXED_USD_TO_INR_RATE).toFixed(2)) },
  { id: 3, credits: 200, inrPrice: 299, usdPrice: parseFloat((299 / FIXED_USD_TO_INR_RATE).toFixed(2)) },
  { id: 4, credits: 500, inrPrice: 349, usdPrice: parseFloat((349 / FIXED_USD_TO_INR_RATE).toFixed(2)) },
  { id: 5, credits: 1000, inrPrice: 499, usdPrice: parseFloat((499 / FIXED_USD_TO_INR_RATE).toFixed(2)) },
];

export const ADMIN_CREDENTIALS = {
  email: 'ankanbayen@gmail.com',
  password: 'Ankan@6295'
};

// Payment gateway configuration is now read server-side from environment variables

// Country options for signup
export const COUNTRIES = [
  { value: 'India', label: 'India' },
  { value: 'USA', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Chile', label: 'Chile' },
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Vietnam', label: 'Vietnam' },
  { value: 'Thailand', label: 'Thailand' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Finland', label: 'Finland' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Ireland', label: 'Ireland' },
  { value: 'Greece', label: 'Greece' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'Russia', label: 'Russia' },
  { value: 'China', label: 'China' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Other', label: 'Other' },
];

export const DEFAULT_COUNTRY = 'India';


// Placeholder image URLs for the demo gallery
export const DEMO_IMAGES = [
  { src: 'https://picsum.photos/id/1018/1024/1024', alt: 'A futuristic cyberpunk city in rain' },
  { src: 'https://picsum.photos/id/1043/1024/1024', alt: 'A serene mountain landscape with a lake' },
  { src: 'https://picsum.photos/id/1025/1024/1024', alt: 'A cute robot serving coffee' },
  { src: 'https://picsum.photos/id/1050/1024/1024', alt: 'Abstract geometric patterns in neon colors' },
  { src: 'https://picsum.photos/id/1054/1024/1024', alt: 'A majestic dragon flying over a medieval castle' },
  { src: 'https://picsum.photos/id/1069/1024/1024', alt: 'Underwater scene with vibrant coral and fish' },
];

// ------------------------------------------------------------------
// LEGAL CONTENT (Full Analysis Implementation)
// ------------------------------------------------------------------

export const DEFAULT_TERMS = `
<h1>Terms of Service</h1>
<p><strong>Effective Date:</strong> January 1, 2025</p>
<p>Welcome to <strong>${BRAND_NAME}</strong> ("we," "our," or "us"). By accessing or using our website and AI image generation services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

<h3>1. Service Description</h3>
<p>${BRAND_NAME} provides an artificial intelligence-powered platform that allows users to generate images based on text prompts ("Services"). We utilize advanced machine learning models to synthesize visuals. The service is operated on a credit-based system.</p>

<h3>2. Account Registration and Security</h3>
<ul>
    <li>You must create an account to use the Services. You agree to provide accurate, current, and complete information.</li>
    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
    <li><strong>Device Authentication:</strong> To prevent abuse of our free tier, we employ device fingerprinting technologies. You acknowledge that creating multiple accounts on the same device to bypass credit limitations is prohibited and may result in account suspension.</li>
</ul>

<h3>3. Credits and Payments</h3>
<ul>
    <li><strong>Free Credits:</strong> New users on unique devices are granted ${INITIAL_CREDITS} free credits. These have no cash value and cannot be transferred.</li>
    <li><strong>Purchases:</strong> Additional credits may be purchased via UPI (for Indian users via Cashfree) or Cryptocurrency (via OXPAY).</li>
    <li><strong>Pricing:</strong> The cost per image generation is ${IMAGE_COST} credits. We reserve the right to modify credit costs and plan pricing at any time.</li>
    <li><strong>Refund Policy:</strong> All credit purchases are final and non-refundable. Please ensure you select the correct plan before purchasing. In the event of a technical failure where credits are deducted but no image is generated, credits will be automatically refunded to your ${BRAND_NAME} balance.</li>
</ul>

<h3>4. User Conduct and Content</h3>
<p>You agree not to use the Services to generate content that:</p>
<ul>
    <li>Violates any applicable law or regulation.</li>
    <li>Infringes upon the intellectual property rights of others.</li>
    <li>Depicts child sexual abuse material (CSAM) or non-consensual sexual content.</li>
    <li>Promotes hate speech, violence, or discrimination.</li>
</ul>
<p>While our models may have "Unfiltered" capabilities, we reserve the right to ban users who abuse the service to generate illegal content.</p>

<h3>5. Intellectual Property</h3>
<ul>
    <li><strong>Your Generations:</strong> Subject to these Terms, you own the rights to the images you generate using our Services. You grant ${BRAND_NAME} a worldwide, non-exclusive, royalty-free license to host and display the content solely for the purpose of providing the Service to you.</li>
    <li><strong>Platform Rights:</strong> All rights, title, and interest in and to the ${BRAND_NAME} website, code, logos, and software remain with us.</li>
</ul>

<h3>6. Disclaimer of Warranties</h3>
<p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties regarding the quality, accuracy, or reliability of the generated images. AI generation is probabilistic, and output may vary.</p>

<h3>7. Limitation of Liability</h3>
<p>To the maximum extent permitted by law, ${BRAND_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>

<h3>8. Contact Information</h3>
<p>If you have any questions about these Terms, please contact us at: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
`;

export const DEFAULT_PRIVACY = `
<h1>Privacy Policy</h1>
<p><strong>Effective Date:</strong> January 1, 2025</p>
<p>At <strong>${BRAND_NAME}</strong>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our image generation platform.</p>

<h3>1. Information We Collect</h3>
<ul>
    <li><strong>Personal Information:</strong> When you register, we collect your name, email address, and country. We do not store your raw passwords; we store only cryptographic hashes.</li>
    <li><strong>Usage Data:</strong> We collect information on how you access the Service, including your device type and browser version, to optimize our platform.</li>
    <li><strong>Device Fingerprint:</strong> To prevent fraud and abuse of our free credit system, we collect a unique device identifier. This does not contain personally identifiable information but allows us to recognize returning devices.</li>
</ul>

<h3>2. How We Use Your Information</h3>
<ul>
    <li>To provide and maintain our Service.</li>
    <li>To manage your account and credit balance.</li>
    <li>To process payments (via third-party gateways like Cashfree and OXPAY).</li>
    <li>To detect and prevent fraud or abuse.</li>
</ul>

<h3>3. Zero Image Storage Policy</h3>
<p><strong>We value your privacy.</strong> Unlike many other platforms:</p>
<ul>
    <li>We <strong>DO NOT</strong> permanently store the images you generate on our servers.</li>
    <li>We <strong>DO NOT</strong> use your prompts or generated images to train our AI models.</li>
    <li>Once you close your session or refresh the page, the images are cleared from the view. Please download your creations immediately.</li>
</ul>

<h3>4. Payment Information</h3>
<p>We do not store your credit card details, UPI IDs, or crypto wallet private keys. All payment transactions are processed through secure third-party payment gateways (Cashfree for UPI, OXPAY for Crypto), which adhere to industry security standards.</p>

<h3>5. Data Security</h3>
<p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>

<h3>6. Changes to This Policy</h3>
<p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

<h3>7. Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
`;
