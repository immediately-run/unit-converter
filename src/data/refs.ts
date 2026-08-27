// Quick-reference tables. Kept as typed data (not MDX) because they're tabular.
export interface RefTable {
  id: string;
  title: string;
  note?: string;
  columns: string[];
  rows: string[][];
}

export interface RefGroup {
  id: string;
  title: string;
  tables: RefTable[];
}

export const REF_GROUPS: RefGroup[] = [
  {
    id: 'paper',
    title: 'Paper sizes',
    tables: [
      {
        id: 'iso-a',
        title: 'ISO A series',
        note: 'Each size is half the previous one; A0 is 1 m².',
        columns: ['Size', 'mm', 'inches'],
        rows: [
          ['A0', '841 × 1189', '33.1 × 46.8'],
          ['A1', '594 × 841', '23.4 × 33.1'],
          ['A2', '420 × 594', '16.5 × 23.4'],
          ['A3', '297 × 420', '11.7 × 16.5'],
          ['A4', '210 × 297', '8.3 × 11.7'],
          ['A5', '148 × 210', '5.8 × 8.3'],
          ['A6', '105 × 148', '4.1 × 5.8'],
          ['A7', '74 × 105', '2.9 × 4.1'],
        ],
      },
      {
        id: 'iso-b',
        title: 'ISO B series',
        columns: ['Size', 'mm', 'inches'],
        rows: [
          ['B0', '1000 × 1414', '39.4 × 55.7'],
          ['B1', '707 × 1000', '27.8 × 39.4'],
          ['B2', '500 × 707', '19.7 × 27.8'],
          ['B3', '353 × 500', '13.9 × 19.7'],
          ['B4', '250 × 353', '9.8 × 13.9'],
          ['B5', '176 × 250', '6.9 × 9.8'],
        ],
      },
      {
        id: 'us',
        title: 'North American',
        columns: ['Size', 'inches', 'mm'],
        rows: [
          ['Letter', '8.5 × 11', '216 × 279'],
          ['Legal', '8.5 × 14', '216 × 356'],
          ['Tabloid / Ledger', '11 × 17', '279 × 432'],
          ['Executive', '7.25 × 10.5', '184 × 267'],
          ['Half letter', '5.5 × 8.5', '140 × 216'],
        ],
      },
    ],
  },
  {
    id: 'clothing',
    title: 'Clothing sizes',
    tables: [
      {
        id: 'women',
        title: "Women's dresses and tops",
        note: 'Brands vary; treat as a starting point.',
        columns: ['Intl', 'US', 'UK', 'EU', 'IT', 'FR', 'JP'],
        rows: [
          ['XS', '2', '6', '34', '38', '34', '7'],
          ['S', '4', '8', '36', '40', '36', '9'],
          ['M', '6', '10', '38', '42', '38', '11'],
          ['M', '8', '12', '40', '44', '40', '13'],
          ['L', '10', '14', '42', '46', '42', '15'],
          ['L', '12', '16', '44', '48', '44', '17'],
          ['XL', '14', '18', '46', '50', '46', '19'],
          ['XXL', '16', '20', '48', '52', '48', '21'],
        ],
      },
      {
        id: 'men-shirts',
        title: "Men's shirts (collar)",
        columns: ['Intl', 'inches', 'cm', 'EU'],
        rows: [
          ['XS', '13.5–14', '34–36', '34–36'],
          ['S', '14.5–15', '37–38', '37–38'],
          ['M', '15.5–16', '39–41', '39–41'],
          ['L', '16.5–17', '42–43', '42–43'],
          ['XL', '17.5–18', '44–45', '44–45'],
          ['XXL', '18.5–19', '46–47', '46–47'],
        ],
      },
      {
        id: 'men-suits',
        title: "Men's suits and jackets",
        columns: ['US / UK', 'EU', 'Chest (in)', 'Chest (cm)'],
        rows: [
          ['34', '44', '34', '86'],
          ['36', '46', '36', '91'],
          ['38', '48', '38', '97'],
          ['40', '50', '40', '102'],
          ['42', '52', '42', '107'],
          ['44', '54', '44', '112'],
          ['46', '56', '46', '117'],
        ],
      },
    ],
  },
  {
    id: 'shoes',
    title: 'Shoe sizes',
    tables: [
      {
        id: 'shoes-men',
        title: "Men's shoes",
        columns: ['US', 'UK', 'EU', 'cm'],
        rows: [
          ['7', '6', '40', '25'],
          ['7.5', '6.5', '40.5', '25.4'],
          ['8', '7', '41', '25.8'],
          ['8.5', '7.5', '42', '26.2'],
          ['9', '8', '42.5', '26.7'],
          ['9.5', '8.5', '43', '27.1'],
          ['10', '9', '44', '27.5'],
          ['10.5', '9.5', '44.5', '27.9'],
          ['11', '10', '45', '28.3'],
          ['12', '11', '46', '29.2'],
          ['13', '12', '47.5', '30'],
        ],
      },
      {
        id: 'shoes-women',
        title: "Women's shoes",
        columns: ['US', 'UK', 'EU', 'cm'],
        rows: [
          ['5', '3', '35.5', '22'],
          ['5.5', '3.5', '36', '22.4'],
          ['6', '4', '36.5', '22.9'],
          ['6.5', '4.5', '37', '23.3'],
          ['7', '5', '37.5', '23.7'],
          ['7.5', '5.5', '38', '24.1'],
          ['8', '6', '38.5', '24.6'],
          ['8.5', '6.5', '39', '25'],
          ['9', '7', '40', '25.4'],
          ['10', '8', '41', '26.2'],
          ['11', '9', '42', '27.1'],
        ],
      },
    ],
  },
  {
    id: 'cooking',
    title: 'Cooking',
    tables: [
      {
        id: 'spoons',
        title: 'Spoons and cups',
        note: 'US customary; a metric cup is 250 ml, a UK tablespoon 15 ml.',
        columns: ['Measure', 'ml', 'Equivalent'],
        rows: [
          ['1 tsp', '4.9', '⅓ tbsp'],
          ['1 tbsp', '14.8', '3 tsp'],
          ['1 fl oz', '29.6', '2 tbsp'],
          ['¼ cup', '59', '4 tbsp'],
          ['⅓ cup', '79', '5⅓ tbsp'],
          ['½ cup', '118', '8 tbsp'],
          ['1 cup', '237', '16 tbsp'],
          ['1 pint', '473', '2 cups'],
          ['1 quart', '946', '4 cups'],
          ['1 gallon', '3785', '16 cups'],
        ],
      },
      {
        id: 'oven',
        title: 'Oven temperatures',
        columns: ['Description', '°C', '°C fan', '°F', 'Gas mark'],
        rows: [
          ['Very slow', '120', '100', '250', '½'],
          ['Slow', '150', '130', '300', '2'],
          ['Moderately slow', '160', '140', '325', '3'],
          ['Moderate', '180', '160', '350', '4'],
          ['Moderately hot', '190', '170', '375', '5'],
          ['Hot', '200', '180', '400', '6'],
          ['Very hot', '220', '200', '425', '7'],
          ['Very hot', '230', '210', '450', '8'],
        ],
      },
      {
        id: 'weights',
        title: 'Common ingredient weights per US cup',
        note: 'Approximate, packed loosely.',
        columns: ['Ingredient', 'g per cup', 'oz per cup'],
        rows: [
          ['All-purpose flour', '125', '4.4'],
          ['Granulated sugar', '200', '7.1'],
          ['Brown sugar (packed)', '220', '7.8'],
          ['Butter', '227', '8'],
          ['Rice (uncooked)', '185', '6.5'],
          ['Rolled oats', '90', '3.2'],
          ['Cocoa powder', '85', '3'],
          ['Honey', '340', '12'],
          ['Water / milk', '240', '8.5'],
        ],
      },
    ],
  },
];
