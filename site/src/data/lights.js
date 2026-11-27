// Day → light mapping and the window crop boxes. Extracted verbatim from the prototype
// (SEQ, NAMES, BOX). Do not edit: the boxes are aligned to building-dark/glow.webp.

/** Light id switched on by each day; index 0 is day 1. */
export const LIGHT_SEQUENCE = [
  "L1",
  "B1",
  "S",
  "LAMP",
  "T1",
  "GIFT",
  "L2",
  "B2",
  "T2",
  "C2a",
  "C2b",
  "C2c",
  "SMOKE1",
  "T3",
  "L3",
  "B3",
  "ICE",
  "C3a",
  "C3b",
  "C3c",
  "T4",
  "SMOKE2",
  "WREATH",
  "STAR",
  "DOOR"
];

/** Human-readable name of each light, used in "Засвітить: …". */
export const LIGHT_NAMES = {
  "L1": "ліве вікно першого поверху",
  "B1": "центральне вікно першого поверху",
  "S": "віконце біля дверей",
  "LAMP": "львівський ліхтар",
  "T1": "гірлянда на великій ялинці ліворуч",
  "GIFT": "подарунок від Миколая",
  "L2": "ліве вікно другого поверху",
  "B2": "центральне вікно другого поверху",
  "T2": "гірлянда на великій ялинці праворуч",
  "C2a": "вузьке вікно другого поверху",
  "C2b": "вузьке вікно другого поверху",
  "C2c": "вузьке вікно другого поверху",
  "SMOKE1": "дим із лівого комина",
  "T3": "гірлянда на маленькій ялинці ліворуч",
  "L3": "ліве вікно третього поверху",
  "B3": "центральне вікно третього поверху",
  "ICE": "бурульки на карнизі",
  "C3a": "вузьке вікно третього поверху",
  "C3b": "вузьке вікно третього поверху",
  "C3c": "вузьке вікно третього поверху",
  "T4": "гірлянда на маленькій ялинці праворуч",
  "SMOKE2": "дим із правого комина",
  "WREATH": "вінок на дверях",
  "STAR": "перша зірка на небі",
  "DOOR": "світло біля дверей"
};

/**
 * Window crop boxes in percent of the illustration: [left, top, width, height].
 * Each lit window shows building-glow.webp through this box.
 */
export const WINDOW_BOXES = {
  "L3": [
    8.139,
    23.628,
    7.488,
    12.589
  ],
  "B3": [
    30.222,
    21.433,
    11.557,
    14.138
  ],
  "C3a": [
    56.267,
    21.627,
    4.286,
    14.009
  ],
  "C3b": [
    62.235,
    21.821,
    4.069,
    14.009
  ],
  "C3c": [
    67.824,
    22.853,
    3.635,
    13.751
  ],
  "L2": [
    8.247,
    40.413,
    7.379,
    13.041
  ],
  "B2": [
    30.602,
    39.251,
    11.232,
    14.203
  ],
  "C2a": [
    56.267,
    40.478,
    4.286,
    12.976
  ],
  "C2b": [
    62.344,
    40.671,
    4.015,
    12.782
  ],
  "C2c": [
    67.824,
    41.059,
    3.744,
    12.589
  ],
  "L1": [
    8.464,
    60.491,
    7.325,
    13.363
  ],
  "B1": [
    30.385,
    59.522,
    11.286,
    14.526
  ],
  "S": [
    52.849,
    65.72,
    4.775,
    12.395
  ]
};

/** @param {number} day 1–25 */
export const lightForDay = (day) => LIGHT_SEQUENCE[day - 1];

/** @param {number} day 1–25 */
export const lightNameForDay = (day) => LIGHT_NAMES[lightForDay(day)];
