export type WebpayReceipt = {
  amount?: number; status?: string; buy_order?: string; session_id?: string;
  transaction_date?: string; authorization_code?: string; payment_type_code?: string;
  response_code?: number;
};

// Keep only reconciliation fields; never persist card details or raw provider errors.
export function cleanWebpayReceipt(value: Record<string, unknown>): WebpayReceipt {
  const receipt: Record<string, unknown> = {};
  for (const key of ['status','buy_order','session_id','transaction_date','authorization_code','payment_type_code']) {
    if (typeof value[key] === 'string' && value[key].length <= 128) receipt[key] = value[key];
  }
  for (const key of ['amount','response_code']) {
    if (typeof value[key] === 'number' && Number.isFinite(value[key])) receipt[key] = value[key];
  }
  return receipt;
}

export const webpayApproved = (receipt: WebpayReceipt) => receipt.status === 'AUTHORIZED' && receipt.response_code === 0;

export function createWebpayProvider(env: Record<string,string|undefined> = process.env, transport: typeof fetch = fetch) {
  const code = env.WEBPAY_COMMERCE_CODE || env.TRANSBANK_COMMERCE_CODE;
  const key = env.WEBPAY_API_KEY || env.TRANSBANK_API_KEY;
  const environment = env.WEBPAY_ENV || env.TRANSBANK_ENVIRONMENT;
  if (!code || !key || !['PRODUCTION','INTEGRATION'].includes(environment || '')) throw new Error('WEBPAY_CONFIG');
  const origin = environment === 'PRODUCTION' ? 'https://webpay3g.transbank.cl' : 'https://webpay3gint.transbank.cl';
  async function request(method: string, token?: string, body?: unknown) {
    if (token !== undefined && !/^[a-zA-Z0-9_-]{10,256}$/.test(token)) throw new Error('WEBPAY_TOKEN');
    const response = await transport(`${origin}/rswebpaytransaction/api/webpay/v1.2/transactions${token ? `/${encodeURIComponent(token)}` : ''}`, {
      method, cache: 'no-store', signal: AbortSignal.timeout(12000),
      headers: {'Content-Type':'application/json','Tbk-Api-Key-Id':code!,'Tbk-Api-Key-Secret':key!},
      ...(body ? {body:JSON.stringify(body)} : {}),
    });
    if (!response.ok) throw new Error(`WEBPAY_HTTP_${response.status}`);
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('WEBPAY_RESPONSE');
    return data;
  }
  return {
    async status(token: string): Promise<WebpayReceipt> { return cleanWebpayReceipt(await request('GET',token)); },
    async commit(token: string): Promise<WebpayReceipt> { return cleanWebpayReceipt(await request('PUT',token)); },
    async create(amount: number, order: string, returnUrl: string): Promise<{token:string;url:string}> {
      const data = await request('POST',undefined,{amount,buy_order:order,session_id:order,return_url:returnUrl});
      if (typeof data.token !== 'string' || !/^[a-zA-Z0-9_-]{10,256}$/.test(data.token) || typeof data.url !== 'string' || new URL(data.url).origin !== origin) throw new Error('WEBPAY_RESPONSE');
      return {token:data.token,url:data.url};
    },
  };
}

// A failed commit is ambiguous. Query status, never repeat PUT within the attempt.
export async function resolveWebpayReturn(provider: Pick<ReturnType<typeof createWebpayProvider>,'status'|'commit'>, token: string, allowCommit: boolean) {
  const current = await provider.status(token);
  if (!allowCommit || current.status !== 'INITIALIZED') return current;
  try { return await provider.commit(token); }
  catch { return await provider.status(token); }
}
