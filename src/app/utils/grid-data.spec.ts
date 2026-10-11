import { toGridData } from './grid-data';

describe('toGridData', () => {
  it('returns empty headers and rows for empty input', () => {
    expect(toGridData([])).toEqual({ headers: [], rows: [] });
  });

  it('maps records to positional rows preserving key order', () => {
    const result = toGridData([
      { id: '1', name: 'Notebook Yoga', price_sale: 900000 },
      { id: '2', name: 'Notebook Asus', price_sale: 1100000 },
    ]);

    expect(result.headers).toEqual(['id', 'name', 'price_sale']);
    expect(result.rows).toEqual([
      ['1', 'Notebook Yoga', 900000],
      ['2', 'Notebook Asus', 1100000],
    ]);
  });

  it('builds headers from the union of keys across records', () => {
    const result = toGridData([{ name: 'Notebook Yoga' }, { id: '2', name: 'Notebook Asus' }]);

    expect(result.headers).toEqual(['name', 'id']);
    expect(result.rows).toEqual([
      ['Notebook Yoga', undefined],
      ['Notebook Asus', '2'],
    ]);
  });
});
