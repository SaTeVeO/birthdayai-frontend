const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const SYSTEM_PROMPTS = {
  he: 'אתה כותב ברכות יום הולדת בעברית בלבד. חובה לכתוב רק בעברית — אין להשתמש באותיות לטיניות, מילים באנגלית, או כל שפה אחרת. אם אתה מכיר מילה רק באנגלית, תרגם אותה לעברית. לדוגמה: במקום "admire" כתוב "מעריץ". כל מילה חייבת להיות בכתב עברי בלבד.',
  en: 'You are an assistant who writes personal and heartfelt birthday greetings. Write the greeting in English only. Do not use any Hebrew, Russian, or other language — not even a single word.',
  ru: 'Ты помощник, который пишет личные и душевные поздравления с днём рождения. Пиши только на русском языке — без английских слов, латинских букв или других языков. Каждое слово должно быть на русском.',
}

const STYLE_PROMPTS = {
  he: {
    warm:   'חמה, אישית ומרגשת — ברכה שמגיעה מהלב',
    funny:  'מצחיקה עם הומור קל — כולל בדיחה או משפט מבדר',
    formal: 'רשמית ומכובדת — ברכה מקצועית ומנומסת',
    short:  'קצרה ותמציתית',
    poetic: 'שירית — כולל משפטים ציוריים ורומנטיים',
  },
  en: {
    warm:   'warm and personal — heartfelt, from the heart',
    funny:  'funny with light humor — include a joke or witty line',
    formal: 'formal and respectful — professional tone',
    short:  'short and concise',
    poetic: 'poetic — include vivid imagery and romantic phrases',
  },
  ru: {
    warm:   'тёплое и личное — идущее от сердца',
    funny:  'смешное с лёгким юмором — включить шутку или остроумную фразу',
    formal: 'официальное и уважительное — профессиональный тон',
    short:  'короткое и лаконичное',
    poetic: 'поэтическое — включить образные и романтические фразы',
  },
}

const GENDER_PHRASES = {
  he: {
    male:    { possessive: 'שלו',    friend: 'חבר שלי',    pronoun: 'הוא' },
    female:  { possessive: 'שלה',    friend: 'חברה שלי',   pronoun: 'היא' },
    unknown: { possessive: 'שלו/שלה', friend: 'חבר/ה שלי', pronoun: 'הוא/היא' },
  },
  en: {
    male:    { possessive: 'his',   pronoun: 'he'   },
    female:  { possessive: 'her',   pronoun: 'she'  },
    unknown: { possessive: 'their', pronoun: 'they' },
  },
  ru: {
    male:    { possessive: 'его', pronoun: 'он'   },
    female:  { possessive: 'её',  pronoun: 'она'  },
    unknown: { possessive: 'его/её', pronoun: 'он/она' },
  },
}

export const LENGTH_WORDS = { short: 50, medium: 100, long: 200 }

// signatureMode: { type: 'none' } | { type: 'single', name } | { type: 'couple', name, partnerName }
export async function generateGreeting(contact, style = 'warm', language = 'he', length = 'medium', signatureMode = { type: 'single', name: '' }, channel = 'whatsapp') {
  const words     = LENGTH_WORDS[length] ?? 100
  const styleDesc = (STYLE_PROMPTS[language] ?? STYLE_PROMPTS.he)[style]
                 ?? (STYLE_PROMPTS[language] ?? STYLE_PROMPTS.he).warm

  const channelHint = channel === 'email'
    ? language === 'he'
      ? 'הברכה מיועדת לשליחה במייל — כתוב בסגנון מסודר עם פסקאות, אל תוסיף אימוג\'ים, אפשר להיות יותר ארוך ומפורט.'
      : language === 'ru'
      ? 'Это поздравление для отправки по email — пиши структурированно, с абзацами, без эмодзи, можно быть подробнее.'
      : 'This greeting is for email — write in a structured style with paragraphs, no emojis, can be longer and more detailed.'
    : language === 'he'
      ? 'הברכה מיועדת לשליחה בוואטסאפ — כתוב בסגנון שיחתי וקצר יחסית, אפשר להוסיף אימוג\'ים מתאימים (לא יותר מ-3), אל תשתמש בכותרות או פסקאות מסודרות.'
      : language === 'ru'
      ? 'Это поздравление для отправки в WhatsApp — пиши в разговорном стиле, коротко, можно добавить 1-3 эмодзи, без заголовков и структурированных абзацев.'
      : 'This greeting is for WhatsApp — write in a conversational, concise style, you may add up to 3 relevant emojis, no headings or structured paragraphs.'

  const firstName = contact.name?.split(' ')[0] ?? contact.name
  const gender  = contact.gender || 'unknown'
  const gp      = (GENDER_PHRASES[language] ?? GENDER_PHRASES.he)[gender]
                ?? (GENDER_PHRASES[language] ?? GENDER_PHRASES.he).unknown

  const hobbies = Array.isArray(contact.hobbies)
    ? contact.hobbies.join(', ')
    : (contact.hobbies || '')

  const PARENT_GRANDPARENT_HE = 'אמא, אבא, סבתא, סבא, אמא רבתא, סבא רבא'
  const SIBLING_HE            = 'אח, אחות, גיס, גיסה'
  const FRIEND_HE             = 'חבר, חברה, עמית, קולגה, מכר, שכן'

  function buildSigRules(lang) {
    const { type, name = '', partnerName = '' } = signatureMode
    if (type === 'none') {
      return lang === 'he'
        ? ['אל תוסיף חתימה בסוף הברכה.']
        : lang === 'ru'
        ? ['Не добавляй подпись в конце поздравления.']
        : ['Do not add a signature at the end of the greeting.']
    }
    if (type === 'couple' && name && partnerName) {
      const senderFirst = name.split(' ')[0]
      return lang === 'he'
        ? [`חתום בסוף עם: ${senderFirst} ו${partnerName}`]
        : lang === 'ru'
        ? [`Подпиши в конце: ${senderFirst} и ${partnerName}`]
        : [`Sign at the end with: ${senderFirst} and ${partnerName}`]
    }
    if (type === 'single' && name) {
      if (lang === 'he') return [
        `בסוף הברכה, חתום עם השם של השולח. שם השולח הוא: ${name}`,
        `חוקי החתימה:
- אם הקרבה היא אמא/אבא/סבתא/סבא (${PARENT_GRANDPARENT_HE}): חתום רק עם הקרבה (לדוגמה: "הבן שלך" או "הנכדה שלך") — אל תשתמש בשם
- אם הקרבה היא אח/אחות (${SIBLING_HE}): חתום בשם פרטי בלבד (המילה הראשונה בלבד)
- כל קרבה משפחתית אחרת: חתום בשם פרטי בלבד
- קרבה רחוקה/עמיתים/שכנים (${FRIEND_HE}): חתום בשם מלא
- אל תכתוב [שמך] או [שם] — כתוב את השם האמיתי: ${name}`,
      ]
      if (lang === 'ru') return [
        `Подпиши поздравление в конце. Имя отправителя: ${name}`,
        `Правила подписи: если отношения — брат, сестра, мама, папа, дедушка, бабушка, сын, дочь, дядя, тётя, муж, жена — только имя. Если друг, подруга, коллега, сосед — полное имя. Используй настоящее имя: ${name}`,
      ]
      return [
        `Sign the greeting at the end with the sender's name: ${name}`,
        `If the relationship is family (brother/sister/mother/father/grandparent/son/daughter/uncle/aunt/husband/wife) — first name only. If friend/colleague/neighbor — full name. Use the actual name: ${name}`,
      ]
    }
    return []
  }

  let prompt
  if (language === 'en') {
    prompt = [
      `Write a birthday greeting in English only for ${firstName}${contact.relationship ? `, who is my ${contact.relationship}` : ''}.`,
      `Use the pronouns ${gp.pronoun}/${gp.possessive} when referring to them.`,
      `If the name "${firstName}" appears to be Hebrew or non-English, transliterate it phonetically into English letters (e.g. רפאל → Rafael). Use the transliterated name throughout the greeting.`,
      hobbies       && `Their hobbies: ${hobbies}.`,
      contact.notes && `Additional info: ${contact.notes}.`,
      `Greeting style: ${styleDesc}.`,
      `The greeting must be no more than ${words} words. Write in English only — no other language.`,
      channelHint,
      'Write only the greeting itself, with no titles, explanations, or quotes.',
      'Do not use em dash (—) or any dashes at all.',
      'Write naturally like a real person, not like AI.',
      ...buildSigRules('en'),
    ].filter(Boolean).join('\n')
  } else if (language === 'ru') {
    prompt = [
      `Напиши поздравление с днём рождения только на русском языке для ${firstName}${contact.relationship ? `, который/которая является моим/моей ${contact.relationship}` : ''}.`,
      `Используй местоимения ${gp.pronoun}/${gp.possessive} при упоминании именинника/именинницы.`,
      `Если имя "${firstName}" написано на иврите или не по-русски, транслитерируй его фонетически в русские буквы (например, רפאל → Рафаэль). Используй транслитерированное имя по всему тексту.`,
      hobbies       && `Увлечения: ${hobbies}.`,
      contact.notes && `Дополнительная информация: ${contact.notes}.`,
      `Стиль поздравления: ${styleDesc}.`,
      `Поздравление должно быть не более ${words} слов. Пиши только на русском языке — никакого другого языка.`,
      channelHint,
      'Пиши только на русском языке, без английских слов.',
      'Напиши только само поздравление, без заголовков, объяснений или цитат.',
      'Не используй длинное тире (—) и вообще никакие тире.',
      'Пиши естественно, как настоящий человек, а не как AI.',
      ...buildSigRules('ru'),
    ].filter(Boolean).join('\n')
  } else {
    const genderedHobby = hobbies
      ? `התחביבים ${gp.possessive}: ${hobbies}.`
      : null
    prompt = [
      `כתוב ברכת יום הולדת בעברית בלבד עבור ${firstName}${contact.relationship ? ` שהוא/היא ${contact.relationship} שלי` : ''}.`,
      `השתמש בצורה המגדרית הנכונה: הכינוי הוא ${gp.pronoun}, המילה "שלו/שלה" היא ${gp.possessive}, ואם מדובר בחבר/חברה אז "${gp.friend}".`,
      contact.relationship && `חוקי פתיחת הברכה:
- אם הקרבה היא אמא/אבא (${PARENT_GRANDPARENT_HE}): אל תכתוב את השם כלל, פתח עם "אמא היקרה" / "אבא היקר" / "סבתא היקרה" / "סבא היקר"
- כל קרבה אחרת: פתח עם השם הפרטי (${firstName})`,
      genderedHobby,
      contact.notes && `מידע נוסף: ${contact.notes}.`,
      `סגנון הברכה: ${styleDesc}.`,
      `הברכה צריכה להיות עד ${words} מילים בלבד. כתוב בעברית בלבד, אל תשתמש באנגלית או בכל שפה אחרת.`,
      channelHint,
      'חשוב מאוד: כתוב בעברית בלבד ללא אף מילה באנגלית או אותיות לטיניות. אם אתה רוצה לכתוב מילה שאתה מכיר רק באנגלית, תרגם אותה לעברית.',
      'כתוב רק את הברכה עצמה ללא כותרות, הסברים, או ציטוטים.',
      'אל תשתמש במקף ארוך (—) בכלל.',
      'אל תתחיל משפטים עם מקף.',
      'כתוב בסגנון טבעי ואנושי, לא בסגנון של AI.',
      'אל תשתמש ברשימות או נקודות.',
      'כתוב כאילו אתה חבר אמיתי שכותב ברכה אישית.',
      ...buildSigRules('he'),
    ].filter(Boolean).join('\n')
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.he },
        { role: 'user',   content: prompt },
      ],
      max_tokens: words * 6,
      temperature: 0.85,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error?.message ?? `שגיאת API: ${res.status}`)
  }

  const data = await res.json()
  return data.choices[0].message.content.trim()
}
