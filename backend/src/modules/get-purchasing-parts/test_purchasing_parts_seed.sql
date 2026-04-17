DELETE FROM "PurchaseOrderPart"
WHERE "po_id" IN ('PO_TEST_01', 'PO_TEST_02', 'PO_TEST_03');

DELETE FROM "PurchaseOrder"
WHERE "po_id" IN ('PO_TEST_01', 'PO_TEST_02', 'PO_TEST_03');

DELETE FROM "Part"
WHERE "part_id" IN (
    'P_TEST_001',
    'P_TEST_002',
    'P_TEST_003',
    'P_TEST_004',
    'P_TEST_005',
    'P_TEST_006',
    'P_TEST_007',
    'P_TEST_008',
    'P_TEST_009',
    'P_TEST_010',
    'P_TEST_011',
    'P_TEST_012',
    'P_TEST_013',
    'P_TEST_014',
    'P_TEST_015'
);

INSERT INTO "Part" (
    "part_id",
    "part_name",
    "stock_quantity",
    "price",
    "reorder_point",
    "reserved_qty"
) VALUES
    ('P_TEST_001', 'Engine Oil Filter', 40, 250.00, 10, 4),
    ('P_TEST_002', 'Cabin Air Filter', 28, 320.00, 8, 2),
    ('P_TEST_003', 'Spark Plug Set', 35, 900.00, 12, 5),
    ('P_TEST_004', 'Brake Pad Front Set', 22, 1800.00, 10, 3),
    ('P_TEST_005', 'Wiper Blade Pair', 18, 450.00, 6, 1),
    ('P_TEST_006', 'Battery 65Ah', 9, 3600.00, 8, 3),
    ('P_TEST_007', 'Radiator Hose', 7, 650.00, 6, 2),
    ('P_TEST_008', 'Timing Belt', 5, 2100.00, 5, 1),
    ('P_TEST_009', 'Fuel Pump', 4, 4200.00, 5, 1),
    ('P_TEST_010', 'Alternator Belt', 6, 780.00, 8, 1),
    ('P_TEST_011', 'Rear Brake Shoe', 8, 1250.00, 9, 2),
    ('P_TEST_012', 'Transmission Fluid', 16, 380.00, 10, 7),
    ('P_TEST_013', 'Coolant Bottle', 21, 220.00, 7, 4),
    ('P_TEST_014', 'Headlight Bulb', 12, 350.00, 10, 5),
    ('P_TEST_015', 'Wheel Bearing', 3, 1600.00, 4, 1);

INSERT INTO "PurchaseOrder" (
    "po_id",
    "order_status",
    "order_date",
    "purchasing_staff_id",
    "supplier_id",
    "order_quantity"
) VALUES
    ('PO_TEST_01', 'Ordered', CURRENT_DATE - INTERVAL '2 days', NULL, NULL, 12),
    ('PO_TEST_02', 'Pending', CURRENT_DATE - INTERVAL '1 day', NULL, NULL, 8),
    ('PO_TEST_03', 'Delivered', CURRENT_DATE - INTERVAL '5 days', NULL, NULL, 10);

INSERT INTO "PurchaseOrderPart" (
    "po_id",
    "part_id",
    "buying_price"
) VALUES
    ('PO_TEST_01', 'P_TEST_006', 3200.00),
    ('PO_TEST_01', 'P_TEST_008', 1800.00),
    ('PO_TEST_02', 'P_TEST_010', 690.00),
    ('PO_TEST_02', 'P_TEST_015', 1400.00),
    ('PO_TEST_03', 'P_TEST_011', 1050.00);
