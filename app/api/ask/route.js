import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { answer: "Please ask a valid question." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_FREE_GEMINI_API_KEY") {
      return NextResponse.json({
        answer: "⚠️ GEMINI_API_KEY is not configured on the server. Please set your GEMINI_API_KEY in the Vercel Environment Variables or local .env file."
      });
    }

    // Supported Gemini models with seamless fallback
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-3.7-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest"
    ];
    let lastError = null;
    let answerText = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: question }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            answerText = candidate;
            break;
          }
        } else {
          const errorData = await response.text();
          lastError = `Gemini API ${model} (${response.status}): ${errorData}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (answerText) {
      return NextResponse.json({ answer: answerText });
    }

    return NextResponse.json({
      answer: `Unable to get a response from AI. Details: ${lastError || 'Unknown error'}`
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json(
      { answer: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
