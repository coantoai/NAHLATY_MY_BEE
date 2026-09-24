# NAHLATY — Lium GPU Controller

Isolated infrastructure branch for controlling Lium GPU compute without using the user's workstation.

## Security boundary
- Never commit `LIUM_API_KEY` or any SSH private key.
- `LIUM_API_KEY` must be supplied only as a cloud environment secret.
- No dependency on the user's work PC.
- This branch does not modify the current Nahlaty product/Vercel experience.
- Initial controller should use a dedicated Lium key and the narrowest practical permissions.
- Every rented pod must have a TTL/auto-termination guard.

## Target path
ChatGPT / cloud workflow -> controller -> Lium API -> B200 -> FastVideo + LTX-2.3

## Lium API
Base: `https://lium.io/api`
Authentication header: `X-API-Key: $LIUM_API_KEY`

## Safe bring-up order
1. Add `LIUM_API_KEY` as a cloud secret (never GitHub source).
2. Verify identity/balance with a read-only authenticated request.
3. List available B200 executors and exact pricing.
4. Do not rent until FastVideo/LTX setup is ready.
5. Rent with a hard TTL and one GPU.
6. Run smoke tests and benchmark.
7. Terminate immediately after the test.


Deployment sync: Lium Preview secret configured; health check deployment requested.
