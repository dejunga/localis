"use server";

export type NewsletterState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot – botovi popunjavaju skrivena polja, ljudi ne
  if (formData.get("website")) {
    return { status: "sent" };
  }

  const email = String(formData.get("email") ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Unesite ispravnu email adresu." };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    console.error("Newsletter: BREVO_API_KEY ili BREVO_LIST_ID nisu postavljeni.");
    return {
      status: "error",
      message: "Prijava trenutno nije moguća. Pokušajte kasnije.",
    };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Newsletter: Brevo je vratio grešku.", response.status, body);
      return {
        status: "error",
        message: "Prijava nije uspjela. Pokušajte ponovno.",
      };
    }

    return { status: "sent" };
  } catch (error) {
    console.error("Newsletter: slanje nije uspjelo.", error);
    return {
      status: "error",
      message: "Prijava nije uspjela. Pokušajte ponovno.",
    };
  }
}
