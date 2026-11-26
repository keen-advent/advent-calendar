// UI strings rendered from JavaScript. Static page text lives in index.html.
// Where Figma and the prototype differ, Figma wording is used (marked "Figma").
// Practice texts are in practices.js; completion messages in completionLines.js.

export const COPY = {
  progress: {
    count: (n) => `Засвічено вогників: ${n} з 25`,
    empty: "Поки в домі темно. Запали перший вогник",
    beforeLaunch: "Календар відкриється 1 грудня",
  },

  day: {
    date: (d) => `${d} грудня`,
    doorLabel: "двері",
    // Accessible tile names, e.g. "10 грудня, Там, де немає відповіді, світиться".
    ariaLabel: (d, title, state) => `${d} грудня, ${title}${state ? `, ${state}` : ""}`,
    stateLit: "світиться",
    stateToday: "сьогодні",
    stateLocked: (d) => `відкриється ${d} грудня`,
    stateDoor: "двері",
  },

  hint: {
    lights: (name) => `Засвітить: ${name}`,
    opensOn: (d) => `відкриється ${d} грудня`,
  },

  reset: {
    idle: "Почати вправи спочатку", // Figma
    confirm: "Так, погасити всі вогники і стерти записи",
    done: "Усі вогники погашено. Дім чекає на грудень.",
  },

  locked: (d) => `Цей день відкриється ${d} грудня. Поспішати нікуди.`,

  modal: {
    close: "Закрити", // close icon label and the secondary button on an already lit day
    meta: (d) => `${d} грудня`,
    metaDoor: (d) => `${d} грудня · двері нашого дому`,
    formatGroup: "Формат",
    formatFull: (m) => `Вправа · ${m} хв`,
    formatSmall: (m) => `Маленька дія · ${m} хв`,
    example: "Приклад",
    mhoPortraitAlt: "mental health officer компанії",
    reflection: "Рефлексія",
    why: "Навіщо це",
    complete: "Завершити вправу", // Figma
    later: "Повернуся пізніше",
    seeHouse: "Подивитися на дім",
    alreadyLit: "Цей день уже світиться. До вправи можна повернутися будь-коли.",
    litNow: (line, name) => `${line} Засвітилось: ${name}. Закрий картку, щоб подивитися.`,
    tip: "Таймер тихий, без звуку. Він лише підказка: можна закінчити раніше або побути довше.",
  },

  timer: {
    start: "Почати",
    pause: "Пауза",
    resume: "Продовжити",
    reset: "Скинути",
    over: "Час минув",
  },

  kit: {
    title: "Мій набір опори",
    headers: ["Коли / для чого", "Мій інструмент", "Варіант на 1–3 хв", "Якщо не допомагає"],
    note: "Картка зберігається лише в цьому браузері.",
    copy: "Скопіювати картку",
    copied: "Картку скопійовано",
    copyFailed: "Не вдалося скопіювати",
    fieldLabel: (row, column) => `${row}: ${column}`,
  },

  methods: {
    summary: "Методи календаря простими словами",
    headers: ["Метод", "Про що він", "Дні"],
  },

  house: {
    alt: (n) =>
      n === 0
        ? "Наша будівля взимку. Вікна ще темні й загоряються з кожною виконаною вправою"
        : `Наша будівля взимку. Засвічено вогників: ${n} з 25`,
  },
};
