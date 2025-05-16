export async function translateText(text, targetLang = 'en') {
    const apiKey = 'AIzaSyA6jPAwmnmPMrRpeB_PwPgRrQPqFIQyNrM';
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            q: text,
            target: targetLang,
            format: 'text',
        }),
    });

    const data = await response.json();

    if (data.data && data.data.translations.length > 0) {
        return Array.isArray(text)
            ? data.data.translations.map(t => t.translatedText)
            : data.data.translations[0].translatedText;
    } else {
        throw new Error("No se pudo traducir");
    }
}