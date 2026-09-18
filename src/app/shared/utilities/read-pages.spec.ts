import { readPages } from './read-pages';
describe('Lectura paginada', () => {
  it('no trunca los resultados al completar una página', async () => {
    const rows = [1, 2, 3, 4, 5];
    const result = await readPages(
      async (from, to) => ({ data: rows.slice(from, to + 1), error: null }),
      2,
    );
    expect(result).toEqual(rows);
  });
  it('propaga un fallo intermedio en vez de devolver datos incompletos', async () => {
    await expect(
      readPages(
        async (from) =>
          from === 0
            ? { data: [1, 2], error: null }
            : { data: null, error: { message: 'Sin conexión' } },
        2,
      ),
    ).rejects.toThrow('Sin conexión');
  });
});
