/** Preserve legacy list contracts without silently accepting the database row cap. */
export async function fetchAllPages<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
    const rows: T[] = [];
    const size = 200;
    for (let from = 0; from < 50000; from += size) {
        const { data, error } = await fetchPage(from, from + size - 1);
        if (error) throw new Error(error.message);
        if (!data) throw new Error('No se pudo confirmar la lista completa');
        rows.push(...data);
        if (data.length < size) return rows;
    }
    throw new Error('La lista requiere filtros adicionales; no se muestran resultados incompletos');
}
