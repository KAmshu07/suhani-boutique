// ─── Customer WhatsApp Status Messages ───────────────────────────────────
// Zero imports. Zero functions. Default message per order status, sent to the
// customer when the order's headline status changes. Hindi (most customers).
// "{no}" is replaced with the order number; Mom can edit before sending.

export const orderStatusMessages = {
  booked: "नमस्ते! 🙏 सुहानी बुटीक में आपका ऑर्डर #{no} दर्ज हो गया है। धन्यवाद!",
  consulted: "नमस्ते! आपके ऑर्डर #{no} के लिए परामर्श पूरा हो गया है।",
  measured: "आपके ऑर्डर #{no} के लिए माप ले लिया गया है। ✅",
  fabric_selected: "आपके ऑर्डर #{no} के लिए कपड़ा चुन लिया गया है।",
  in_progress: "आपका ऑर्डर #{no} अब सिलाई के लिए तैयार हो रहा है। ✂️",
  ready_for_fitting: "आपका ऑर्डर #{no} फिटिंग के लिए तैयार है! कृपया एक बार आकर ट्राई कर लें। 😊",
  alterations: "आपके ऑर्डर #{no} में थोड़ा सा अल्टरेशन किया जा रहा है।",
  completed: "खुशखबरी! आपका ऑर्डर #{no} पूरी तरह तैयार है। आप इसे लेने आ सकते हैं। ✨",
  delivered: "आपका ऑर्डर #{no} डिलीवर हो गया है। धन्यवाद, फिर मिलते हैं! 🙏😊",
} as const;
