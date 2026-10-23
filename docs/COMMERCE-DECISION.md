# Confirmed platform choices

The owner selected Spotify with its documented playback limits and a custom store with a South African payment gateway. Shopify is not the selected commerce architecture.

The custom store will own ZAR prices in integer cents, products/variants, transactional stock reservations, carts, orders, immutable checkout snapshots and refund/fulfilment state. The selected gateway will handle card collection and payment processing. Verified webhooks, idempotent processing, sandbox purchases and reconciliation must be implemented before launch. No gateway, merchant account, product data or payment integration has been provisioned in this Studio event slice.

Gateway choice, approved merchandise/photos/prices, shipping/tax/refund policies and merchant credentials remain required. Never store card details or treat purchases as marketing consent.
