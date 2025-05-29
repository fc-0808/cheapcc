export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error(JSON.stringify({
        message: "RECAPTCHA_SECRET_KEY is not set in environment variables.",
        source: "verifyRecaptcha",
    }, null, 2));
    return false;
  }

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(verificationUrl, { method: "POST" });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(JSON.stringify({
            message: "reCAPTCHA verification request to Google failed.",
            status: response.status,
            statusText: response.statusText,
            errorBody,
            tokenUsed: token ? token.substring(0, 10) + "..." : "N/A",
            source: "verifyRecaptcha",
        }, null, 2));
        return false;
    }
    const data = await response.json();
    if (!data.success) {
        console.warn(JSON.stringify({
            message: "reCAPTCHA verification failed by Google.",
            recaptchaResponse: data,
            tokenUsed: token ? token.substring(0, 10) + "..." : "N/A",
            source: "verifyRecaptcha",
        }, null, 2));
    }
    return data.success;
  } catch (error: any) {
    console.error(JSON.stringify({
        message: "Error verifying reCAPTCHA with Google API.",
        errorMessage: error.message,
        errorStack: error.stack,
        source: "verifyRecaptcha",
    }, null, 2));
    return false;
  }
} 