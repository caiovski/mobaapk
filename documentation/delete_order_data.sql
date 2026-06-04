SELECT count(*)
DELETE FROM public.order_items;
DELETE FROM public.order_messages;
DELETE FROM public.payment_transactions;
DELETE FROM public.audit_logs;
DELETE FROM public.orders;