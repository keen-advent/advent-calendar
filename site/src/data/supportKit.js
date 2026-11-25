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
