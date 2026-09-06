type Service = { id:string; nombre:string; precio:number|null; multiplicador_noches:boolean|null; multiplicador_personas:boolean|null };
export function buildAdminExtras(catalog:Service[], selected:string[], courtesy:Set<string>, nightsByService:Record<string,number>, prices:Record<string,number>, nights:number, adults:number) {
    if (!Number.isInteger(nights) || nights<=0 || !Number.isInteger(adults) || adults<=0 || new Set(selected).size!==selected.length || catalog.length!==selected.length) throw new Error('Invalid selection');
    return catalog.map(s=>{
        const isMeal = /cena|romántico|almuerzo/i.test(s.nombre);
        const serviceNights = isMeal && nightsByService[s.id] !== undefined ? Number(nightsByService[s.id]) : nights;
        const free = courtesy.has(s.id);
        const price = free ? 0 : Number(prices[s.id] ?? s.precio ?? 0);
        const quantity = (s.multiplicador_noches ? serviceNights : 1) * (s.multiplicador_personas ? adults : 1);
        if (!Number.isSafeInteger(serviceNights) || serviceNights<=0 || serviceNights>nights || !Number.isSafeInteger(price) || price<0 || !Number.isSafeInteger(quantity) || quantity<=0 || !Number.isSafeInteger(price*quantity)) throw new Error('Invalid extras');
        return {servicio_id:s.id,cantidad:quantity,precio_unitario:price,total:free?0:price*quantity,es_cortesia:free};
    });
}
