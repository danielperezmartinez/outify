/** Lee todas las páginas sin depender del límite por defecto de la Data API. */
export async function readPages<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = 500,
): Promise<T[]> {
  const result: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    if (page.error) throw new Error(page.error.message);
    result.push(...(page.data ?? []));
    if (!page.data || page.data.length < pageSize) return result;
  }
}
