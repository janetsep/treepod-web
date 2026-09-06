/** No automatic retries: an uncertain network result must be reviewed first. */
export async function runSaveBatch<T>(items: T[], save: (item:T)=>Promise<void>) {
    const saved:T[]=[];
    const unconfirmed:T[]=[];
    for(const item of items) {
        try { await save(item); saved.push(item); }
        catch { unconfirmed.push(item); }
    }
    return {saved,unconfirmed};
}

export async function requireSaved(response:Response):Promise<Record<string,any>> {
    const data=await response.json().catch(()=>null);
    if(!response.ok || !data || data.ok!==true) throw new Error(data?.error || 'No se pudo confirmar el guardado. Revisa antes de reintentar.');
    return data;
}
