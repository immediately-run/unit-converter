// Unit catalogue. Every unit converts through its category's base unit via
// `toBase` / `fromBase`; linear units use the `lin(factor)` shorthand.
// Values are exact where a definition exists (SI, international yard/pound).

export interface Unit {
  /** Stable id within the category, used in persisted favourites (`<cat>:<id>`). */
  id: string;
  name: string;
  plural: string;
  symbol: string;
  /** Extra parse aliases (lower-case, spaces removed). Name/plural/symbol are implicit. */
  aliases?: string[];
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export interface Category {
  id: string;
  name: string;
  /** Short caption shown under the category name. */
  hint: string;
  /** id of the default "from" unit and default highlighted target. */
  defaultFrom: string;
  defaultTo: string;
  units: Unit[];
}

const lin = (factor: number) => ({
  toBase: (v: number) => v * factor,
  fromBase: (v: number) => v / factor,
});

const u = (
  id: string,
  name: string,
  plural: string,
  symbol: string,
  factor: number,
  aliases: string[] = [],
): Unit => ({ id, name, plural, symbol, aliases, ...lin(factor) });

const M = 1; // metre
const IN = 0.0254;
const FT = 0.3048;
const YD = 0.9144;
const MI = 1609.344;
const LB = 0.45359237;
const L = 1; // litre
const GAL_US = 3.785411784;
const GAL_UK = 4.54609;
const FLOZ_US = GAL_US / 128;

export const CATEGORIES: Category[] = [
  {
    id: 'length',
    name: 'Length',
    hint: 'metres, feet, miles…',
    defaultFrom: 'km',
    defaultTo: 'mi',
    units: [
      u('mm', 'millimetre', 'millimetres', 'mm', 0.001 * M, ['millimeter', 'millimeters']),
      u('cm', 'centimetre', 'centimetres', 'cm', 0.01 * M, ['centimeter', 'centimeters']),
      u('m', 'metre', 'metres', 'm', M, ['meter', 'meters']),
      u('km', 'kilometre', 'kilometres', 'km', 1000 * M, ['kilometer', 'kilometers', 'kms']),
      u('um', 'micrometre', 'micrometres', 'µm', 1e-6 * M, ['micron', 'microns', 'micrometer', 'um']),
      u('in', 'inch', 'inches', 'in', IN, ['"', 'inchs']),
      u('ft', 'foot', 'feet', 'ft', FT, ["'"]),
      u('yd', 'yard', 'yards', 'yd', YD, ['yds']),
      u('mi', 'mile', 'miles', 'mi', MI),
      u('nmi', 'nautical mile', 'nautical miles', 'nmi', 1852 * M, ['nm']),
      u('ly', 'light-year', 'light-years', 'ly', 9.4607304725808e15, ['lightyear', 'lightyears']),
    ],
  },
  {
    id: 'mass',
    name: 'Mass',
    hint: 'grams, pounds, stones…',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    units: [
      u('mg', 'milligram', 'milligrams', 'mg', 1e-6),
      u('g', 'gram', 'grams', 'g', 0.001, ['gramme', 'grammes']),
      u('kg', 'kilogram', 'kilograms', 'kg', 1, ['kilo', 'kilos']),
      u('t', 'tonne', 'tonnes', 't', 1000, ['metricton', 'metrictons']),
      u('oz', 'ounce', 'ounces', 'oz', LB / 16),
      u('lb', 'pound', 'pounds', 'lb', LB, ['lbs']),
      u('st', 'stone', 'stones', 'st', LB * 14),
      u('ton-us', 'US ton', 'US tons', 'tn', LB * 2000, ['shortton', 'shorttons', 'uston', 'ustons', 'ton', 'tons']),
      u('ton-uk', 'UK ton', 'UK tons', 'lt', LB * 2240, ['longton', 'longtons', 'ukton', 'uktons']),
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    hint: '°C, °F, K',
    defaultFrom: 'c',
    defaultTo: 'f',
    units: [
      {
        id: 'c',
        name: 'Celsius',
        plural: 'Celsius',
        symbol: '°C',
        aliases: ['c', '°c', 'degc', 'centigrade', 'degreescelsius', 'degreesc'],
        toBase: (v) => v + 273.15,
        fromBase: (v) => v - 273.15,
      },
      {
        id: 'f',
        name: 'Fahrenheit',
        plural: 'Fahrenheit',
        symbol: '°F',
        aliases: ['f', '°f', 'degf', 'degreesfahrenheit', 'degreesf'],
        toBase: (v) => ((v - 32) * 5) / 9 + 273.15,
        fromBase: (v) => ((v - 273.15) * 9) / 5 + 32,
      },
      { id: 'k', name: 'kelvin', plural: 'kelvin', symbol: 'K', aliases: ['k', 'kelvins'], ...lin(1) },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    hint: 'm², acres, hectares…',
    defaultFrom: 'm2',
    defaultTo: 'ft2',
    units: [
      u('mm2', 'square millimetre', 'square millimetres', 'mm²', 1e-6, ['mm2', 'sqmm']),
      u('cm2', 'square centimetre', 'square centimetres', 'cm²', 1e-4, ['cm2', 'sqcm']),
      u('m2', 'square metre', 'square metres', 'm²', 1, ['m2', 'sqm', 'squaremeter', 'squaremeters']),
      u('ha', 'hectare', 'hectares', 'ha', 1e4),
      u('km2', 'square kilometre', 'square kilometres', 'km²', 1e6, ['km2', 'sqkm']),
      u('in2', 'square inch', 'square inches', 'in²', IN * IN, ['in2', 'sqin']),
      u('ft2', 'square foot', 'square feet', 'ft²', FT * FT, ['ft2', 'sqft']),
      u('yd2', 'square yard', 'square yards', 'yd²', YD * YD, ['yd2', 'sqyd']),
      u('ac', 'acre', 'acres', 'ac', 4046.8564224),
      u('mi2', 'square mile', 'square miles', 'mi²', MI * MI, ['mi2', 'sqmi']),
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    hint: 'litres, gallons, cups…',
    defaultFrom: 'l',
    defaultTo: 'gal-us',
    units: [
      u('ml', 'millilitre', 'millilitres', 'ml', 0.001 * L, ['milliliter', 'milliliters', 'cc']),
      u('l', 'litre', 'litres', 'l', L, ['liter', 'liters', 'ltr']),
      u('m3', 'cubic metre', 'cubic metres', 'm³', 1000 * L, ['m3', 'cubicmeter', 'cubicmeters']),
      u('tsp', 'teaspoon', 'teaspoons', 'tsp', FLOZ_US / 6),
      u('tbsp', 'tablespoon', 'tablespoons', 'tbsp', FLOZ_US / 2, ['tbs']),
      u('floz-us', 'fluid ounce (US)', 'fluid ounces (US)', 'fl oz', FLOZ_US, ['floz', 'fluidounce', 'fluidounces', 'usfloz']),
      u('floz-uk', 'fluid ounce (UK)', 'fluid ounces (UK)', 'fl oz (UK)', GAL_UK / 160, ['ukfloz', 'imperialfloz']),
      u('cup-us', 'cup (US)', 'cups (US)', 'cup', FLOZ_US * 8, ['cup', 'cups', 'uscup', 'uscups']),
      u('cup-metric', 'cup (metric)', 'cups (metric)', 'cup (250 ml)', 0.25 * L, ['metriccup', 'metriccups']),
      u('pt-us', 'pint (US)', 'pints (US)', 'pt', FLOZ_US * 16, ['pint', 'pints', 'uspint', 'uspints']),
      u('pt-uk', 'pint (UK)', 'pints (UK)', 'pt (UK)', GAL_UK / 8, ['ukpint', 'ukpints', 'imperialpint']),
      u('qt-us', 'quart (US)', 'quarts (US)', 'qt', FLOZ_US * 32, ['quart', 'quarts']),
      u('gal-us', 'gallon (US)', 'gallons (US)', 'gal', GAL_US, ['gallon', 'gallons', 'usgal', 'usgallon', 'usgallons']),
      u('gal-uk', 'gallon (UK)', 'gallons (UK)', 'gal (UK)', GAL_UK, ['ukgal', 'ukgallon', 'ukgallons', 'imperialgallon']),
      u('in3', 'cubic inch', 'cubic inches', 'in³', IN ** 3 * 1000, ['in3', 'cuin']),
      u('ft3', 'cubic foot', 'cubic feet', 'ft³', FT ** 3 * 1000, ['ft3', 'cuft']),
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    hint: 'km/h, mph, knots…',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    units: [
      u('mps', 'metre per second', 'metres per second', 'm/s', 1, ['m/s', 'meterspersecond']),
      u('kmh', 'kilometre per hour', 'kilometres per hour', 'km/h', 1000 / 3600, ['km/h', 'kph', 'kmph', 'kilometersperhour']),
      u('mph', 'mile per hour', 'miles per hour', 'mph', MI / 3600, ['mi/h', 'milesperhour']),
      u('kn', 'knot', 'knots', 'kn', 1852 / 3600, ['kt', 'kts']),
      u('fts', 'foot per second', 'feet per second', 'ft/s', FT, ['ft/s', 'fps', 'feetpersecond']),
      u('mach', 'Mach', 'Mach', 'Ma', 340.29, ['ma']),
    ],
  },
  {
    id: 'time',
    name: 'Time',
    hint: 'seconds, hours, weeks…',
    defaultFrom: 'h',
    defaultTo: 'min',
    units: [
      u('ms', 'millisecond', 'milliseconds', 'ms', 0.001, ['millis']),
      u('s', 'second', 'seconds', 's', 1, ['sec', 'secs']),
      u('min', 'minute', 'minutes', 'min', 60, ['mins']),
      u('h', 'hour', 'hours', 'h', 3600, ['hr', 'hrs']),
      u('d', 'day', 'days', 'd', 86400),
      u('wk', 'week', 'weeks', 'wk', 7 * 86400, ['wks']),
      u('mo', 'month (avg)', 'months (avg)', 'mo', 30.436875 * 86400, ['month', 'months']),
      u('yr', 'year', 'years', 'yr', 365.25 * 86400, ['y', 'yrs']),
    ],
  },
  {
    id: 'data',
    name: 'Data',
    hint: 'bytes, SI and IEC',
    defaultFrom: 'gb',
    defaultTo: 'gib',
    units: [
      u('bit', 'bit', 'bits', 'bit', 1 / 8),
      u('byte', 'byte', 'bytes', 'B', 1),
      u('kb', 'kilobyte', 'kilobytes', 'kB', 1e3, ['kb']),
      u('mb', 'megabyte', 'megabytes', 'MB', 1e6, ['mb']),
      u('gb', 'gigabyte', 'gigabytes', 'GB', 1e9, ['gb']),
      u('tb', 'terabyte', 'terabytes', 'TB', 1e12, ['tb']),
      u('pb', 'petabyte', 'petabytes', 'PB', 1e15, ['pb']),
      u('kib', 'kibibyte', 'kibibytes', 'KiB', 1024, ['kib']),
      u('mib', 'mebibyte', 'mebibytes', 'MiB', 1024 ** 2, ['mib']),
      u('gib', 'gibibyte', 'gibibytes', 'GiB', 1024 ** 3, ['gib']),
      u('tib', 'tebibyte', 'tebibytes', 'TiB', 1024 ** 4, ['tib']),
      u('pib', 'pebibyte', 'pebibytes', 'PiB', 1024 ** 5, ['pib']),
      u('kbit', 'kilobit', 'kilobits', 'kbit', 1e3 / 8, ['kbps']),
      u('mbit', 'megabit', 'megabits', 'Mbit', 1e6 / 8, ['mbps']),
      u('gbit', 'gigabit', 'gigabits', 'Gbit', 1e9 / 8, ['gbps']),
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    hint: 'joules, calories, kWh…',
    defaultFrom: 'kcal',
    defaultTo: 'kj',
    units: [
      u('j', 'joule', 'joules', 'J', 1),
      u('kj', 'kilojoule', 'kilojoules', 'kJ', 1e3),
      u('mj', 'megajoule', 'megajoules', 'MJ', 1e6),
      u('cal', 'calorie', 'calories', 'cal', 4.184),
      u('kcal', 'kilocalorie', 'kilocalories', 'kcal', 4184, ['calorie(food)', 'foodcalorie', 'foodcalories']),
      u('wh', 'watt-hour', 'watt-hours', 'Wh', 3600, ['watthour', 'watthours']),
      u('kwh', 'kilowatt-hour', 'kilowatt-hours', 'kWh', 3.6e6, ['kilowatthour', 'kilowatthours']),
      u('btu', 'BTU', 'BTU', 'BTU', 1055.05585262, ['btus']),
      u('ftlb', 'foot-pound', 'foot-pounds', 'ft·lbf', 1.3558179483314, ['ftlbf', 'footpound', 'footpounds']),
      u('ev', 'electronvolt', 'electronvolts', 'eV', 1.602176634e-19),
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    hint: 'bar, psi, atm…',
    defaultFrom: 'bar',
    defaultTo: 'psi',
    units: [
      u('pa', 'pascal', 'pascals', 'Pa', 1),
      u('hpa', 'hectopascal', 'hectopascals', 'hPa', 100),
      u('kpa', 'kilopascal', 'kilopascals', 'kPa', 1e3),
      u('mpa', 'megapascal', 'megapascals', 'MPa', 1e6),
      u('bar', 'bar', 'bar', 'bar', 1e5, ['bars']),
      u('mbar', 'millibar', 'millibars', 'mbar', 100),
      u('atm', 'atmosphere', 'atmospheres', 'atm', 101325),
      u('psi', 'pound per square inch', 'pounds per square inch', 'psi', 6894.757293168),
      u('mmhg', 'millimetre of mercury', 'millimetres of mercury', 'mmHg', 133.322387415, ['torr']),
      u('inhg', 'inch of mercury', 'inches of mercury', 'inHg', 3386.389),
    ],
  },
  {
    id: 'fuel',
    name: 'Fuel economy',
    hint: 'L/100 km, mpg',
    defaultFrom: 'l100km',
    defaultTo: 'mpg-us',
    units: [
      // Base: kilometres per litre. L/100 km is reciprocal, so it needs functions.
      {
        id: 'l100km',
        name: 'litre per 100 km',
        plural: 'litres per 100 km',
        symbol: 'L/100 km',
        aliases: ['l/100km', 'l100km', 'lper100km', 'litresper100km', 'litersper100km'],
        toBase: (v) => (v === 0 ? Infinity : 100 / v),
        fromBase: (v) => (v === 0 ? Infinity : 100 / v),
      },
      u('kml', 'kilometre per litre', 'kilometres per litre', 'km/L', 1, ['km/l', 'kmpl', 'kilometersperliter']),
      u('mpg-us', 'mile per gallon (US)', 'miles per gallon (US)', 'mpg', MI / 1000 / GAL_US, ['mpg', 'usmpg', 'mpgus']),
      u('mpg-uk', 'mile per gallon (UK)', 'miles per gallon (UK)', 'mpg (UK)', MI / 1000 / GAL_UK, ['ukmpg', 'mpguk', 'imperialmpg']),
    ],
  },
  {
    id: 'cooking',
    name: 'Cooking',
    hint: 'cups, spoons, ml',
    defaultFrom: 'cup',
    defaultTo: 'ml',
    units: [
      u('ml', 'millilitre', 'millilitres', 'ml', 0.001 * L, ['milliliter', 'milliliters']),
      u('l', 'litre', 'litres', 'l', L, ['liter', 'liters']),
      u('tsp', 'teaspoon', 'teaspoons', 'tsp', FLOZ_US / 6, ['teasp']),
      u('tbsp', 'tablespoon', 'tablespoons', 'tbsp', FLOZ_US / 2, ['tbs', 'tblsp']),
      u('floz', 'fluid ounce (US)', 'fluid ounces (US)', 'fl oz', FLOZ_US, ['floz', 'fluidounce', 'fluidounces']),
      u('cup', 'cup (US)', 'cups (US)', 'cup', FLOZ_US * 8, ['cups', 'uscup', 'uscups']),
      u('cup-metric', 'cup (metric)', 'cups (metric)', 'cup (250 ml)', 0.25 * L, ['metriccup', 'metriccups']),
      u('pint', 'pint (US)', 'pints (US)', 'pt', FLOZ_US * 16, ['pt', 'pints']),
      u('quart', 'quart (US)', 'quarts (US)', 'qt', FLOZ_US * 32, ['qt', 'quarts']),
      u('dash', 'dash', 'dashes', 'dash', FLOZ_US / 48, ['dashes']),
      u('pinch', 'pinch', 'pinches', 'pinch', FLOZ_US / 96, ['pinches']),
    ],
  },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);
