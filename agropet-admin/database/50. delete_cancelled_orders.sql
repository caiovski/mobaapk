BEGIN;

DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders WHERE status = 'cancelled'
);

DELETE FROM orders
WHERE status = 'cancelled';

COMMIT;
