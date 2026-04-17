TLDR: GET http://localhost:3000/parts บอก part ทุกชิ้นพร้อม status

มี 3 filter บอก part อิงตาม Status
GET http://localhost:3000/parts?status=Inventory
GET http://localhost:3000/parts?status=Nearly%20Out%20of%20Stock
GET http://localhost:3000/parts?status=Waiting%20for%20delivery

Example
GET http://localhost:3000/parts

Response Body
{
    "message": "Purchasing parts fetched successfully",
    "data": [
        {
            "part_id": "P_TEST_001",
            "part_name": "Engine Oil Filter",
            "stock_qty": 40,
            "price": "250.00",
            "reorder_point": 10,
            "reserved_qty": 4,
            "status": "Inventory"
        },
        {
            "part_id": "P_TEST_002",
            "part_name": "Cabin Air Filter",
            "stock_qty": 28,
            "price": "320.00",
            "reorder_point": 8,
            "reserved_qty": 2,
            "status": "Inventory"
        },
        ## มีอีกแต่มันยาวเกินพี่ชายลองใช้ test_purchasing_part_seed แล้วลองดู
    ]
}

GET http://localhost:3000/parts?status=Inventory

Response Body
{
    "message": "Purchasing parts fetched successfully",
    "data": [
        {
            "part_id": "P_TEST_001",
            "part_name": "Engine Oil Filter",
            "stock_qty": 40,
            "price": "250.00",
            "reorder_point": 10,
            "reserved_qty": 4,
            "status": "Inventory"
        },
        {
            "part_id": "P_TEST_002",
            "part_name": "Cabin Air Filter",
            "stock_qty": 28,
            "price": "320.00",
            "reorder_point": 8,
            "reserved_qty": 2,
            "status": "Inventory"
        },
        ## มีอีกแต่มันยาวเกินพี่ชายลองใช้ test_purchasing_part_seed แล้วลองดู
    ]
}

http://localhost:3000/parts?status=Nearly%20Out%20of%20Stock

Response Body
{
    "message": "Purchasing parts fetched successfully",
    "data": [
        {
            "part_id": "P_TEST_007",
            "part_name": "Radiator Hose",
            "stock_qty": 7,
            "price": "650.00",
            "reorder_point": 6,
            "reserved_qty": 2,
            "status": "Nearly Out of Stock"
        },
        {
            "part_id": "P_TEST_009",
            "part_name": "Fuel Pump",
            "stock_qty": 4,
            "price": "4200.00",
            "reorder_point": 5,
            "reserved_qty": 1,
            "status": "Nearly Out of Stock"
        },
        {
            "part_id": "P_TEST_011",
            "part_name": "Rear Brake Shoe",
            "stock_qty": 8,
            "price": "1250.00",
            "reorder_point": 9,
            "reserved_qty": 2,
            "status": "Nearly Out of Stock"
        },
        {
            "part_id": "P_TEST_012",
            "part_name": "Transmission Fluid",
            "stock_qty": 16,
            "price": "380.00",
            "reorder_point": 10,
            "reserved_qty": 7,
            "status": "Nearly Out of Stock"
        },
        {
            "part_id": "P_TEST_014",
            "part_name": "Headlight Bulb",
            "stock_qty": 12,
            "price": "350.00",
            "reorder_point": 10,
            "reserved_qty": 5,
            "status": "Nearly Out of Stock"
        }
    ]
}

GET http://localhost:3000/parts?status=Waiting%20for%20delivery

Response Body
{
    "message": "Purchasing parts fetched successfully",
    "data": [
        {
            "part_id": "P_TEST_006",
            "part_name": "Battery 65Ah",
            "stock_qty": 9,
            "price": "3600.00",
            "reorder_point": 8,
            "reserved_qty": 3,
            "status": "Waiting for delivery"
        },
        {
            "part_id": "P_TEST_008",
            "part_name": "Timing Belt",
            "stock_qty": 5,
            "price": "2100.00",
            "reorder_point": 5,
            "reserved_qty": 1,
            "status": "Waiting for delivery"
        },
        {
            "part_id": "P_TEST_010",
            "part_name": "Alternator Belt",
            "stock_qty": 6,
            "price": "780.00",
            "reorder_point": 8,
            "reserved_qty": 1,
            "status": "Waiting for delivery"
        },
        {
            "part_id": "P_TEST_015",
            "part_name": "Wheel Bearing",
            "stock_qty": 3,
            "price": "1600.00",
            "reorder_point": 4,
            "reserved_qty": 1,
            "status": "Waiting for delivery"
        }
    ]
}