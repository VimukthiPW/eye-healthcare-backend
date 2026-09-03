const { GoogleGenAI } = require('@google/genai');

// =================================================
// Gemini Client
// =================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =================================================
// Eagle Vision Bot Instructions
// =================================================

const EAGLE_VISION_INSTRUCTIONS = `
You are Eagle Vision Bot, an AI assistant inside the EagleVision
eye healthcare mobile application.

Your main purpose is to provide simple and educational information
about eye health.

You can help users with:

- Cataracts
- Glaucoma
- Conjunctivitis
- Dry eyes
- Diabetic retinopathy
- Eye strain
- Eye hygiene
- General eye care
- Vision problems
- Eye examinations
- Eye-care tips
- Doctor appointments

IMPORTANT RULES:

1. Answer eye-health-related questions clearly and simply.

2. If a user describes symptoms, provide general information only.
Do NOT diagnose the user.

3. Never say that a user definitely has a particular disease.

4. Encourage the user to consult a qualified eye-care professional
when symptoms require professional assessment.

5. If the user reports sudden vision loss, severe eye pain,
serious eye injury, or another potentially urgent eye problem,
recommend seeking urgent professional medical care.

6. If the user asks about booking an appointment, explain that
they can use the Book Appointment feature in the EagleVision app.

7. If the user asks something unrelated to eye health, politely
explain that you are Eagle Vision Bot and mainly help with
eye-health-related questions.

8. Do not invent patient information, doctor information,
appointment information, medical reports, or test results.

9. Keep responses short and easy to understand.

10. Use friendly and professional language.

11. You are an educational assistant and do not replace a doctor.

12. If the user asks what you can do, explain that you can help
with general eye-health information, symptoms, eye-care tips,
and appointment guidance.

13. If the user says hello, greet them and ask how you can help
with their eye health.

14. Do not provide a medical diagnosis or prescribe medication.

15. Avoid unnecessarily technical medical terminology. If a
technical term is needed, explain it simply.

Example for an unrelated question:

User:
"What is the weather today?"

Response:
"I'm Eagle Vision Bot, so I mainly help with eye-health questions.
You can ask me about eye symptoms, eye diseases, eye care,
or appointments."
`;

// =================================================
// POST /api/bot/chat
// =================================================

const handleChat = async (req, res) => {
  try {

    // -------------------------------------------------
    // Get User Message
    // -------------------------------------------------

    const { message } = req.body;

    // -------------------------------------------------
    // Validate Message
    // -------------------------------------------------

    if (
      !message ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const userMessage = message.trim();

    // -------------------------------------------------
    // Send Message to Gemini
    // -------------------------------------------------

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',

      contents: userMessage,

      config: {
        systemInstruction: EAGLE_VISION_INSTRUCTIONS,

        maxOutputTokens: 300,

        temperature: 0.4,
      },
    });

    // -------------------------------------------------
    // Get AI Response
    // -------------------------------------------------

    const botReply = aiResponse.text?.trim();

    // -------------------------------------------------
    // Check Empty Response
    // -------------------------------------------------

    if (!botReply) {
      return res.status(500).json({
        success: false,
        message: 'Eagle Vision Bot did not return a response.',
      });
    }

    // -------------------------------------------------
    // Send Response to Mobile App
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      reply: botReply,
    });

  } catch (error) {

    console.error('=================================');
    console.error('EAGLE VISION GEMINI BOT ERROR');
    console.error(error);
    console.error('=================================');

    // -------------------------------------------------
    // API Key Error
    // -------------------------------------------------

    if (
      error?.status === 401 ||
      error?.status === 403
    ) {
      return res.status(500).json({
        success: false,
        message:
          'Gemini API key is invalid or not configured correctly.',
      });
    }

    // -------------------------------------------------
    // Rate Limit Error
    // -------------------------------------------------

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          'Eagle Vision Bot has temporarily reached the Gemini API limit. Please try again later.',
      });
    }

    // -------------------------------------------------
    // General Error
    // -------------------------------------------------

    return res.status(500).json({
      success: false,
      message:
        'Unable to get a response from Eagle Vision Bot.',
      error:
        error.message,
    });
  }
};

// =================================================
// Export
// =================================================

module.exports = {
  handleChat,
};