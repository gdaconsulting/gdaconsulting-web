export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const requestedLanguage = url.searchParams.get("lang");

  if (url.pathname === "/" && (requestedLanguage === "es" || requestedLanguage === "en")) {
    const destination = new URL(requestedLanguage === "es" ? "/es/" : "/", url.origin);
    for (const [key, value] of url.searchParams) {
      if (key !== "lang") destination.searchParams.append(key, value);
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: destination.toString(),
        "Set-Cookie": "gda_language=" + requestedLanguage + "; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
        "Cache-Control": "private, no-store",
        Vary: "Cookie, CF-IPCountry",
      },
    });
  }

  if (url.pathname === "/") {
    const cookie = request.headers.get("Cookie") || "";
    const languagePreference = cookie.match(/(?:^|;\\s*)gda_language=(en|es)(?:;|$)/)?.[1];
    if (languagePreference) return context.next();

    const country = request.cf?.country || request.headers.get("CF-IPCountry");
    if (country === "AR") {
      return new Response(null, {
        status: 302,
        headers: {
          Location: new URL("/es/", url.origin).toString(),
          "Set-Cookie": "gda_language=es; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
          "Cache-Control": "private, no-store",
          Vary: "Cookie, CF-IPCountry",
        },
      });
    }
  }

  return context.next();
}
