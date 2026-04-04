// ─── Business Information ────────────────────────────────────────
// Zero imports. Zero functions. Plain business data.

export const businessInfo = {
  name: "Suhani Boutique",
  phone: "+919XXXXXXXXX",
  whatsappNumber: "919XXXXXXXXX",
  email: "suhani.boutique.raipur@gmail.com",
  address: {
    line1: "Suhani Boutique",
    line2: "Raipur, Chhattisgarh",
    city: "Raipur",
    state: "Chhattisgarh",
    pincode: "492001",
    country: "India",
  },
  hours: {
    weekdays: "10:00 AM – 7:00 PM",
    sunday: "Closed",
  },
  experience: "20+",
  coordinates: {
    lat: 21.2514,
    lng: 81.6296,
  },
  whatsappGreeting: {
    en: "Hi! I'm interested in your tailoring services. Could you help me?",
    hi: "नमस्ते! मुझे आपकी टेलरिंग सेवाओं में रुचि है। क्या आप मदद कर सकते हैं?",
    cg: "नमस्ते! मोला तुंहर टेलरिंग सेवा म रुचि हे। का तुमन मदद कर सकथव?",
  },
} as const;
