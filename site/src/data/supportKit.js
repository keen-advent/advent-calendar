// Day-25 "Мій набір опори" card. Extracted verbatim from the prototype (ROWS, EXTRA).

/** Table rows: the situation and the printed fallback in the "Якщо не допомагає" column. */
export const KIT_ROWS = [
  {
    "when": "Помічаю перевантаження",
    "fallback": "Перегляд обсягу / підтримка"
  },
  {
    "when": "Застрягаю в думках",
    "fallback": "Зовнішня дія / допомога"
  },
  {
    "when": "Потрібне відновлення",
    "fallback": "Довша перерва / зміна умов"
  },
  {
    "when": "Потрібна межа або контакт",
    "fallback": "Інша людина / інший канал"
  },
  {
    "when": "Хочу повернути важливе",
    "fallback": "Зменшити крок / відкласти"
  }
];

/** Free-text prompts under the table. */
export const KIT_EXTRA = [
  "Я не використовую… (практики, що погіршують стан)",
  "Мій контакт підтримки…",
  "Звернуся по професійну допомогу, якщо…"
];

/**
 * Placeholder examples shown in empty fields (Figma 50:219), keyed like the saved card:
 * c{row}a = Мій інструмент, c{row}b = Варіант на 1–3 хв, c{row}c = Якщо не допомагає,
 * e{i} = extra fields. Examples only: never saved and never part of the copied text.
 */
export const KIT_PLACEHOLDERS = {
  c0a: "Розмова з керівником",
  c0b: "STOP перед відповіддю",
  c0c: "Переглянути обсяг",
  c1a: "«Помічаю думку, що…»",
  c1b: "3 предмети навколо",
  c1c: "Прогулянка надворі",
  c2a: "Тиша після зустрічей",
  c2b: "4 хв без екрана",
  c2c: "Довший вихідний",
  c3a: "Прохання в 4 реченнях",
  c3b: "«Повернуся пізніше»",
  c3c: "Звернутися до фахівця",
  c4a: "Крок у своєму напрямку",
  c4b: "Одна дія на 5 хвилин",
  c4c: "Відкласти на тиждень",
  e0: "Нескінченне гортання новин перед сном",
  e1: "Близька людина або mental health officer компанії",
  e2: "Два тижні поспіль погано сплю й важко працювати",
};
