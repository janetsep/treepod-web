/** An absent secret must never turn a scheduled task into a public endpoint. */
export function isCronAuthorized(request: Request, secret: string | undefined): boolean {
    return !!secret?.trim() && request.headers.get('authorization') === `Bearer ${secret}`;
}
