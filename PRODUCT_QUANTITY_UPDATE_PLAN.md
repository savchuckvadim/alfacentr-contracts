# Product Quantity Update Plan

## Goal

Add a reliable way to increase/decrease product quantity in a deal, with Bitrix as source of truth.

## Current State (Project)

- Frontend currently reads deal products via `GET /alfa-deal-products/:domain/:dealId`.
- Product rows include enough fields for quantity updates (`id`, `productId`, `quantity`, `price`, `measure*`, `sort`).
- Bitrix wrappers already expose product row operations:
  - `list`
  - `add`
  - `set`
- Participant-product distribution is derived state and must be recomputed after product row changes.

## Bitrix API Constraints to Respect

- `crm.item.productrow` behavior is safer with full `set` (all rows for owner) than with ad-hoc partial updates.
- Quantity updates can accidentally drop row metadata if request payload is incomplete.
- Concurrent changes (multi-user edits) can overwrite each other if update is not based on latest `list`.
- Identifying row by `productId` is unsafe when deal has duplicate rows for same product.

## Recommended Architecture

### 1) Backend is write gateway

Do not update quantity directly from frontend via Bitrix SDK.
Create a backend endpoint for quantity update.

Suggested route:

- `PATCH /alfa-deal-products/:domain/:dealId/quantity`

Suggested request DTO:

```json
{
  "rowId": 12345,
  "mode": "delta",
  "value": 1
}
```

Alternative explicit mode:

- `mode = "set"` with absolute quantity value.

### 2) Update flow inside backend use-case

1. Init Bitrix by domain.
2. `list` all deal product rows.
3. Find target by `rowId`.
4. Compute `newQuantity`:
   - `delta`: `current + value`
   - `set`: `value`
5. Validate constraints:
   - no negative quantity
   - optional min/max
6. Build full `productRows` payload preserving row metadata:
   - `id`
   - `productId`
   - `productName`
   - `price` / `priceNetto`
   - `discount*`
   - `measure*`
   - `sort`
   - updated `quantity`
7. Call `productRow.set({ ownerType: DEAL, ownerId: dealId, productRows })`.
8. Return updated row summary (or full rows snapshot).

### 3) Frontend sync strategy

1. Add thunk `changeProductQuantity`.
2. Call backend PATCH endpoint.
3. On success, run `fetchProducts(dealId)`.
4. Let existing selectors/hooks recompute participant-product derived structures.

## FSD Placement (Suggested)

### Frontend

- `entities/product/model/ProductThunk.ts`
  - add `changeProductQuantity` thunk
- `entities/product/model/ProductSlice.ts`
  - loading/error flags for quantity update
- `features/product-quantity-adjust/`
  - UI buttons `+/-`
  - optional confirmation/validation UX

### Backend

- `apps/back/src/modules/alfa-products/controller/`
  - add PATCH endpoint
- `apps/back/src/modules/alfa-products/use-case/`
  - orchestrate list/validate/set flow
- `apps/back/src/modules/alfa-products/services/`
  - helper for safe row rebuild

## Business Rules to Finalize Before Coding

1. Is `quantity = 0` allowed?
   - If no: clamp to 1
   - If yes: keep row with 0 or remove row?
2. Decimal quantities allowed or integer only?
3. Max quantity cap?
4. Should quantity updates be allowed for all product types or filtered (PPK/seminar)?
5. What should UI do on conflict/retry?

## Risks and Mitigations

- **Race conditions** -> always `list -> compute -> set` based on latest server state.
- **Data loss in row payload** -> preserve all critical fields during rebuild.
- **Duplicate product rows** -> target by `rowId`, never only by `productId`.
- **Derived state drift** -> always refetch products after mutation.

## Minimal Delivery Plan

1. Backend PATCH endpoint with `rowId + delta`.
2. Frontend thunk + refetch.
3. Add `+/-` controls near quantity badge/card/table.
4. Validation + error toast.
5. Manual test matrix:
   - increase/decrease
   - boundary at min
   - duplicate product rows
   - simultaneous edits

## Nice-to-have (Phase 2)

- optimistic UI with rollback
- idempotency key / conflict token
- audit log for quantity changes
- batch quantity update endpoint

