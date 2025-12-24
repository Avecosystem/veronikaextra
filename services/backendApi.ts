// services/backendApi.ts
import { User, ApiResponse, PaymentRequest, CryptoPaymentTransaction, CreditPlan, ContactInfo, SocialLinks, LegalContent } from '../types';
import { INITIAL_CREDITS, IMAGE_COST, ADMIN_CREDENTIALS, DEFAULT_COUNTRY, CREDIT_PLANS, FIXED_USD_TO_INR_RATE, CONTACT_EMAIL, DEFAULT_TERMS, DEFAULT_PRIVACY } from '../constants';

interface MockUser extends User {
  passwordHash: string;
}

interface StoredData {
  users: MockUser[];
  sessions: { [token: string]: number }; // token -> userId
  paymentRequests: PaymentRequest[]; // UPI payment requests
  cryptoPaymentTransactions: CryptoPaymentTransaction[]; // OXPAY crypto payment transactions
  nextUserId: number;
  nextPaymentRequestId: number; // For UPI payment request IDs
  nextCryptoTransactionId: number; // For Crypto transaction IDs
  globalNotice: string;
  creditsPageNotice: string; // New: Notice specifically for the credits page
  creditPlans: CreditPlan[]; // New: Dynamic credit plans managed by admin
  contactInfo: ContactInfo; // New: Dynamic contact info
  socialLinks: SocialLinks; // New: Dynamic social links
  legalContent: LegalContent; // New: Dynamic legal pages
  claimedDeviceIds: string[]; // NEW: Track devices that have already claimed free credits
}

const STORAGE_KEY = 'veronikaextra_mock_db';

const getStoredData = (): StoredData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsedData: StoredData = JSON.parse(data);
    // Ensure new fields are initialized if old data format exists
    if (!parsedData.paymentRequests) parsedData.paymentRequests = [];
    if (!parsedData.nextPaymentRequestId) parsedData.nextPaymentRequestId = 1;
    if (!parsedData.cryptoPaymentTransactions) parsedData.cryptoPaymentTransactions = [];
    if (!parsedData.nextCryptoTransactionId) parsedData.nextCryptoTransactionId = 1;
    if (!parsedData.globalNotice) parsedData.globalNotice = ''; // Initialize globalNotice
    if (!parsedData.creditsPageNotice) parsedData.creditsPageNotice = ''; // Initialize creditsPageNotice
    if (!parsedData.creditPlans) parsedData.creditPlans = CREDIT_PLANS; // Initialize with constant plans
    if (!parsedData.claimedDeviceIds) parsedData.claimedDeviceIds = []; // Initialize claimedDeviceIds
    if (!parsedData.contactInfo) {
        parsedData.contactInfo = {
            email1: CONTACT_EMAIL,
            email2: '',
            location: '',
            phone: '',
            note: ''
        };
    }
    if (!parsedData.socialLinks) {
        parsedData.socialLinks = {
            instagram: '',
            twitter: '',
            website: '',
            general: ''
        };
    }
    if (!parsedData.legalContent) {
        parsedData.legalContent = {
            terms: DEFAULT_TERMS,
            privacy: DEFAULT_PRIVACY
        };
    }

    parsedData.users = parsedData.users.map(user => ({ // Ensure all users have a country and isAdmin
      ...user,
      country: user.country || DEFAULT_COUNTRY, // Default existing users to 'India' or your chosen default
      isAdmin: user.isAdmin ?? false, // Default isAdmin to false if not present
    }));
    return parsedData;
  }
  return {
    users: [],
    sessions: {},
    paymentRequests: [],
    cryptoPaymentTransactions: [],
    nextUserId: 1,
    nextPaymentRequestId: 1,
    nextCryptoTransactionId: 1,
    globalNotice: '',
    creditsPageNotice: '', // Default empty
    creditPlans: CREDIT_PLANS, // Initialize with constant values
    contactInfo: {
        email1: CONTACT_EMAIL,
        email2: '',
        location: '',
        phone: '',
        note: ''
    },
    socialLinks: {
        instagram: '',
        twitter: '',
        website: '',
        general: ''
    },
    legalContent: {
        terms: DEFAULT_TERMS,
        privacy: DEFAULT_PRIVACY
    },
    claimedDeviceIds: [] // New DB
  };
};

const saveStoredData = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

const generateToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Initialize admin user if not present, or update if credentials changed
const initializeAdminUser = () => {
  const data = getStoredData();
  let adminUser = data.users.find(user => user.email === ADMIN_CREDENTIALS.email);

  if (!adminUser) {
    const newAdminUser: MockUser = {
      id: data.nextUserId++,
      name: 'Admin',
      email: ADMIN_CREDENTIALS.email,
      passwordHash: ADMIN_CREDENTIALS.password,
      credits: 999999,
      createdAt: new Date().toISOString(),
      isAdmin: true,
      country: DEFAULT_COUNTRY,
    };
    data.users.push(newAdminUser);
    saveStoredData(data);
  } else {
    let updated = false;
    if (adminUser.passwordHash !== ADMIN_CREDENTIALS.password) {
        adminUser.passwordHash = ADMIN_CREDENTIALS.password;
        updated = true;
    }
    if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        updated = true;
    }
    if (updated) {
        saveStoredData(data);
    }
  }
};
initializeAdminUser(); 

const isAdminUser = (userId: number): boolean => {
  const data = getStoredData();
  const user = data.users.find(u => u.id === userId);
  return user ? user.isAdmin === true : false;
};


export const backendApi = {
  // Updated register to accept deviceId
  async register(name: string, email: string, passwordHash: string, country: string, deviceId: string): Promise<ApiResponse<User>> {
    const data = getStoredData();

    if (data.users.some((user) => user.email === email)) {
      return { success: false, message: 'Email already registered.' };
    }

    // CHECK DEVICE ID
    let startingCredits = INITIAL_CREDITS;
    
    // If device ID exists in the claimed list, give 0 credits
    if (deviceId && data.claimedDeviceIds.includes(deviceId)) {
        console.warn(`Device ${deviceId} has already claimed free credits. Setting balance to 0.`);
        startingCredits = 0; 
    } else if (deviceId) {
        // First time this device is seen, mark it as claimed
        data.claimedDeviceIds.push(deviceId);
    }

    const newUser: MockUser = {
      id: data.nextUserId++,
      name,
      email,
      passwordHash,
      credits: startingCredits, // Use the calculated credits
      createdAt: new Date().toISOString(),
      isAdmin: false,
      country: country,
    };
    data.users.push(newUser);
    saveStoredData(data);

    const token = generateToken();
    data.sessions[token] = newUser.id;
    saveStoredData(data);

    const userProfile: User = { ...newUser };
    delete (userProfile as MockUser).passwordHash;
    
    return { success: true, data: userProfile, token };
  },

  async login(email: string, passwordHash: string): Promise<ApiResponse<User>> {
    const data = getStoredData();
    const user = data.users.find(
      (u) => u.email === email && u.passwordHash === passwordHash,
    );

    if (!user) {
      return { success: false, message: 'Invalid credentials.' };
    }

    const token = generateToken();
    data.sessions[token] = user.id;
    saveStoredData(data);

    const userProfile: User = { ...user };
    delete (userProfile as MockUser).passwordHash; 

    return { success: true, data: userProfile, token };
  },

  async getProfile(token: string): Promise<ApiResponse<User>> {
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const user = data.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const userProfile: User = { ...user };
    delete (userProfile as MockUser).passwordHash; 
    return { success: true, data: userProfile };
  },

  async generateImage(token: string, prompt: string, numberOfImages: number = 1): Promise<ApiResponse<{ images: string[], newCredits: number }>> {
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const userIndex = data.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const user = data.users[userIndex];
    const requiredCredits = IMAGE_COST * numberOfImages;

    if (user.credits < requiredCredits) {
      return { success: false, message: 'Insufficient credits.' };
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, numberOfImages }),
      });

      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
         let errorMessage = 'Server failed to generate images.';
         if (contentType && contentType.includes("application/json")) {
             const errorData = await response.json();
             errorMessage = errorData.message || errorMessage;
         } else {
             const text = await response.text();
             console.error("Non-JSON Backend Error:", text.substring(0, 200));
             errorMessage = `Server connection failed (${response.status}).`;
         }
         
         if (response.status === 504) {
             errorMessage = "The request timed out. The server took too long.";
         }
         throw new Error(errorMessage);
      }

      const result = await response.json();
      const imageUrls = result.images.map((img: any) => img.url);

      const generatedCount = imageUrls.length;
      const actualCost = IMAGE_COST * generatedCount;

      data.users[userIndex].credits -= actualCost;
      if (data.users[userIndex].credits < 0) data.users[userIndex].credits = 0;
      
      saveStoredData(data);

      return { success: true, data: { images: imageUrls, newCredits: data.users[userIndex].credits } };

    } catch (error: any) {
      console.error("Backend generation call failed:", error);
      return { success: false, message: error.message || 'Failed to connect to image generation server.' };
    }
  },

  async addCredits(token: string, userIdToAdd: number, amount: number): Promise<ApiResponse<User>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const userIndex = data.users.findIndex((u) => u.id === userIdToAdd);
    if (userIndex === -1) {
      return { success: false, message: 'Target user not found.' };
    }

    data.users[userIndex].credits += amount;
    saveStoredData(data);

    const updatedUser: User = { ...data.users[userIndex] };
    delete (updatedUser as MockUser).passwordHash;
    return { success: true, data: updatedUser };
  },

  async submitUpiPaymentIntent(token: string, plan: string, credits: number, amount: number, customerPhone: string, returnUrl: string): Promise<ApiResponse<{ message: string; paymentLink?: string }>> {
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const orderId = `${userId}-${credits}-${Date.now()}`;

    const newPaymentRequest: PaymentRequest = {
      id: data.nextPaymentRequestId++,
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      plan: plan,
      credits: credits,
      amount: amount,
      utrCode: orderId, // Using OrderID as ref
      date: new Date().toISOString().split('T')[0],
      note: 'Cashfree UPI Intent',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    data.paymentRequests.push(newPaymentRequest);
    saveStoredData(data);

    try {
        const response = await fetch('/api/cashfree', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: orderId,
                amount: amount,
                customerPhone: customerPhone,
                customerName: user.name,
                customerEmail: user.email,
                returnUrl: returnUrl
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            return { success: true, data: { message: 'Redirecting to UPI...', paymentLink: result.paymentLink } };
        } else {
            return { success: false, message: result.message || 'Payment initiation failed' };
        }

    } catch (e: any) {
        console.error("UPI Backend Error:", e);
        return { success: false, message: 'Server connection failed' };
    }
  },

  async submitCryptoPaymentIntent(token: string, orderId: string, credits: number, amount: number, returnUrl: string): Promise<ApiResponse<{ message: string; paymentUrl?: string }>> {
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const newCryptoTransaction: CryptoPaymentTransaction = {
      id: data.nextCryptoTransactionId++,
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      orderId: orderId,
      credits: credits,
      amount: amount,
      currency: 'USD',
      gateway: 'OXPAY',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    data.cryptoPaymentTransactions.push(newCryptoTransaction);
    saveStoredData(data);

    try {
        const apiResponse = await fetch('/api/oxapay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: Number(amount.toFixed(2)),
                returnUrl: returnUrl,
                description: `Purchase ${credits} Credits - ${user.name}`,
                orderId: orderId,
                email: user.email
            }),
        });

        const result = await apiResponse.json();

        if (result.success) {
             return { 
                 success: true, 
                 data: { 
                     message: 'Crypto payment intent recorded. Redirecting...', 
                     paymentUrl: result.paymentUrl 
                 } 
             };
        } else {
            console.error("Oxapay API Error:", result);
            return { success: false, message: `Payment Gateway Error: ${result.message || 'Unknown error'}` };
        }

    } catch (error) {
        console.error("Oxapay Network Error:", error);
        return { success: false, message: 'Failed to connect to payment gateway.' };
    }
  },

  async verifyPaymentStatus(token: string, orderId: string, provider: 'OXPAY' | 'CASHFREE'): Promise<ApiResponse<{ newCredits: number }>> {
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }
    
    let creditsToAdd = 0;
    let transactionFound = false;

    if (provider === 'OXPAY') {
        const tIndex = data.cryptoPaymentTransactions.findIndex(t => t.orderId === orderId && t.userId === userId);
        if (tIndex > -1) {
            transactionFound = true;
            if (data.cryptoPaymentTransactions[tIndex].status === 'completed') {
                return { success: true, data: { newCredits: data.users.find(u=>u.id===userId)?.credits || 0 }, message: 'Already completed.' };
            }
            creditsToAdd = data.cryptoPaymentTransactions[tIndex].credits;
        }
    } else {
        const tIndex = data.paymentRequests.findIndex(t => t.utrCode === orderId && t.userId === userId);
        if (tIndex > -1) {
             transactionFound = true;
             if (data.paymentRequests[tIndex].status === 'approved') {
                 return { success: true, data: { newCredits: data.users.find(u=>u.id===userId)?.credits || 0 }, message: 'Already completed.' };
             }
             creditsToAdd = data.paymentRequests[tIndex].credits;
        }
    }

    if (!transactionFound) {
        return { success: false, message: 'Transaction record not found.' };
    }

    try {
        if (provider === 'CASHFREE') {
            const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success && verifyData.status === 'PAID') {
                const uIndex = data.users.findIndex(u => u.id === userId);
                if (uIndex > -1) {
                    data.users[uIndex].credits += creditsToAdd;
                    const reqIndex = data.paymentRequests.findIndex(t => t.utrCode === orderId);
                    if (reqIndex > -1) data.paymentRequests[reqIndex].status = 'approved';
                    saveStoredData(data);
                    return { success: true, data: { newCredits: data.users[uIndex].credits } };
                }
            }
        } else {
             const uIndex = data.users.findIndex(u => u.id === userId);
             if (uIndex > -1) {
                 data.users[uIndex].credits += creditsToAdd;
                 const tIndex = data.cryptoPaymentTransactions.findIndex(t => t.orderId === orderId);
                 if (tIndex > -1) {
                     data.cryptoPaymentTransactions[tIndex].status = 'completed';
                     data.cryptoPaymentTransactions[tIndex].completedAt = new Date().toISOString();
                 }
                 saveStoredData(data);
                 return { success: true, data: { newCredits: data.users[uIndex].credits } };
             }
        }
    } catch (e) {
        console.error("Verification failed:", e);
    }

    return { success: false, message: 'Payment verification failed.' };
  },

  async verifyOxapayPayment(token: string, orderId: string, status: string): Promise<ApiResponse<{ newCredits: number }>> {
      return this.verifyPaymentStatus(token, orderId, 'OXPAY');
  },

  async getAllUsers(token: string): Promise<ApiResponse<User[]>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const users = data.users.map(u => {
      const userProfile: User = { ...u };
      delete (userProfile as MockUser).passwordHash;
      return userProfile;
    });
    return { success: true, data: users };
  },

  async updateUserCreditsAdmin(token: string, targetUserId: number, newCredits: number): Promise<ApiResponse<User>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const userIndex = data.users.findIndex(u => u.id === targetUserId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    data.users[userIndex].credits = newCredits;
    saveStoredData(data);

    const updatedUser: User = { ...data.users[userIndex] };
    delete (updatedUser as MockUser).passwordHash;
    return { success: true, data: updatedUser, message: 'Credits updated successfully.' };
  },

  async deleteUser(token: string, userIdToDelete: number): Promise<ApiResponse<{ message: string }>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    if (userIdToDelete === adminId) {
      return { success: false, message: 'Cannot delete your own admin account.' };
    }

    const userExists = data.users.some(u => u.id === userIdToDelete);
    if (!userExists) {
         return { success: false, message: 'User not found.' };
    }

    data.users = data.users.filter(u => u.id !== userIdToDelete);
    Object.keys(data.sessions).forEach(key => {
      if (data.sessions[key] === userIdToDelete) {
        delete data.sessions[key];
      }
    });
    saveStoredData(data);
    return { success: true, data: { message: 'User deleted successfully.' } };
  },

  async getAllPaymentRequests(token: string): Promise<ApiResponse<PaymentRequest[]>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }
    return { success: true, data: data.paymentRequests };
  },

  async getAllCryptoPaymentTransactions(token: string): Promise<ApiResponse<CryptoPaymentTransaction[]>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }
    return { success: true, data: data.cryptoPaymentTransactions };
  },

  async approvePaymentRequest(token: string, requestId: number): Promise<ApiResponse<{ message: string }>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const requestIndex = data.paymentRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'Payment request not found.' };
    }

    const request = data.paymentRequests[requestIndex];
    if (request.status !== 'pending') {
      return { success: false, message: 'Payment request already processed.' };
    }

    const userIndex = data.users.findIndex(u => u.id === request.userId);
    if (userIndex === -1) {
      return { success: false, message: 'User associated with request not found.' };
    }

    let creditsToAdd = Number(request.credits);
    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
        const creditsMatch = request.plan.match(/(\d+)\s*Credits/i);
        creditsToAdd = creditsMatch ? parseInt(creditsMatch[1], 10) : 0;
    }

    if (creditsToAdd > 0) {
        data.users[userIndex].credits = (data.users[userIndex].credits || 0) + creditsToAdd;
    }
    
    data.paymentRequests[requestIndex].status = 'approved';
    saveStoredData(data);

    const message = creditsToAdd > 0 
        ? `Payment request approved. ${creditsToAdd} credits added to user.` 
        : 'Payment request approved (No specific credits found to add).';

    return { success: true, data: { message } };
  },

  async rejectPaymentRequest(token: string, requestId: number): Promise<ApiResponse<{ message: string }>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const requestIndex = data.paymentRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'Payment request not found.' };
    }

    const request = data.paymentRequests[requestIndex];
    if (request.status !== 'pending') {
      return { success: false, message: 'Payment request already processed.' };
    }

    data.paymentRequests[requestIndex].status = 'rejected';
    saveStoredData(data);
    return { success: true, data: { message: 'Payment request rejected.' } };
  },

  async getGlobalNotice(): Promise<ApiResponse<string>> {
    const data = getStoredData();
    return { success: true, data: data.globalNotice };
  },

  async setGlobalNotice(token: string, message: string): Promise<ApiResponse<string>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    data.globalNotice = message;
    saveStoredData(data);
    return { success: true, data: message, message: 'Global notice updated successfully.' };
  },

  async getCreditsPageNotice(): Promise<ApiResponse<string>> {
    const data = getStoredData();
    return { success: true, data: data.creditsPageNotice };
  },

  async setCreditsPageNotice(token: string, message: string): Promise<ApiResponse<string>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    data.creditsPageNotice = message;
    saveStoredData(data);
    return { success: true, data: message, message: 'Credits page notice updated successfully.' };
  },

  async getAvailableCreditPlans(): Promise<ApiResponse<CreditPlan[]>> {
    const data = getStoredData();
    return { success: true, data: data.creditPlans };
  },

  async getAdminCreditPlans(token: string): Promise<ApiResponse<CreditPlan[]>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }
    return { success: true, data: data.creditPlans };
  },

  async updateAdminCreditPlan(token: string, planId: number, updatedCredits: number, updatedInrPrice: number, updatedUsdPrice: number): Promise<ApiResponse<CreditPlan>> {
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const planIndex = data.creditPlans.findIndex(p => p.id === planId);
    if (planIndex === -1) {
      return { success: false, message: 'Credit plan not found.' };
    }

    data.creditPlans[planIndex] = {
      ...data.creditPlans[planIndex],
      credits: updatedCredits,
      inrPrice: updatedInrPrice,
      usdPrice: updatedUsdPrice,
    };
    saveStoredData(data);

    return { success: true, data: data.creditPlans[planIndex], message: 'Credit plan updated successfully.' };
  },

  async getUserPaymentRequests(token: string): Promise<ApiResponse<PaymentRequest[]>> {
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const userRequests = data.paymentRequests.filter(req => req.userId === userId);
    return { success: true, data: userRequests };
  },

  async getUserCryptoTransactions(token: string): Promise<ApiResponse<CryptoPaymentTransaction[]>> {
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const userTransactions = data.cryptoPaymentTransactions.filter(tx => tx.userId === userId);
    return { success: true, data: userTransactions };
  },

  // NEW: Get contact info (Publicly accessible)
  async getContactInfo(): Promise<ApiResponse<ContactInfo>> {
      const data = getStoredData();
      return { success: true, data: data.contactInfo };
  },

  // NEW: Update contact info (Admin only)
  async updateContactInfo(token: string, newInfo: ContactInfo): Promise<ApiResponse<ContactInfo>> {
      const data = getStoredData();
      const adminId = data.sessions[token];

      if (!adminId || !isAdminUser(adminId)) {
          return { success: false, message: 'Forbidden: Admin access required.' };
      }

      data.contactInfo = newInfo;
      saveStoredData(data);
      return { success: true, data: data.contactInfo, message: 'Contact info updated successfully.' };
  },

  // NEW: Get Social Links
  async getSocialLinks(): Promise<ApiResponse<SocialLinks>> {
      const data = getStoredData();
      return { success: true, data: data.socialLinks };
  },

  // NEW: Update Social Links (Admin only)
  async updateSocialLinks(token: string, links: SocialLinks): Promise<ApiResponse<SocialLinks>> {
      const data = getStoredData();
      const adminId = data.sessions[token];
      if (!adminId || !isAdminUser(adminId)) {
          return { success: false, message: 'Forbidden' };
      }
      data.socialLinks = links;
      saveStoredData(data);
      // DISPATCH EVENT so Footer updates immediately without refresh
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('socialLinksUpdated'));
      }
      return { success: true, data: links, message: 'Social links updated.' };
  },

  // NEW: Get Legal Content
  async getLegalContent(): Promise<ApiResponse<LegalContent>> {
      const data = getStoredData();
      return { success: true, data: data.legalContent };
  },

  // NEW: Update Legal Content (Admin only)
  async updateLegalContent(token: string, content: LegalContent): Promise<ApiResponse<LegalContent>> {
      const data = getStoredData();
      const adminId = data.sessions[token];
      if (!adminId || !isAdminUser(adminId)) {
          return { success: false, message: 'Forbidden' };
      }
      data.legalContent = content;
      saveStoredData(data);
      return { success: true, data: content, message: 'Legal content updated.' };
  },

  logout(token: string): void {
    const data = getStoredData();
    delete data.sessions[token];
    saveStoredData(data);
  },
};