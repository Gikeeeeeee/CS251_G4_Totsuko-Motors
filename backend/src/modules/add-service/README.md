POST http://localhost:3000/service/create
Header null #No authen yet
Request body
{
  "vehicle_type": "Sedan",
  "color": "Black",
  "year": 2023,
  "model": "Civic",
  "brand": "Honda",
  "plate_number": "กข-1234",
  "name": "Somchai Jaidee",
  "phone": "0812345678",
  "address": "123 Sukhumvit Road, Bangkok",
  "email": "somchai@example.com",
  "request_status": "Pending",
  "problem_description": "Engine makes a loud noise when starting",
  "odometer": 45000
}

Response body
{
    "message": "Service request created successfully",
    "data": {
        "customer": {
            "customerId": "C2C722954E",
            "name": "Somchai Jaidee",
            "phone": "0812345678",
            "address": "123 Sukhumvit Road, Bangkok",
            "email": "somchai@example.com"
        },
        "vehicle": {
            "vehicleId": "V6334C050F",
            "vehicleType": "Sedan",
            "color": "Black",
            "year": 2023,
            "model": "Civic",
            "brand": "Honda",
            "plateNumber": "กข-1234",
            "customerId": "C2C722954E"
        },
        "serviceRequest": {
            "requestId": "R41DDA9BC4",
            "checkingDate": "2026-04-17T06:26:51.754Z",
            "requestStatus": "Pending",
            "problemDescription": "Engine makes a loud noise when starting",
            "odometer": 45000,
            "customerId": "C2C722954E",
            "vehicleId": "V6334C050F",
            "clerkId": null,
            "technicianId": null
        }
    }
}