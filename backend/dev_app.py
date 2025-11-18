from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import json
import os

app = FastAPI()
 
# mock inventory data for distribution centers
INVENTORY_DATA = {
    "dc1": [
        {
            "id": "item_1",
            "name": "Fresh Apples",
            "category": "produce", 
            "quantity": 150,
            "unit": "Ibs",
            "expiry": "2025-01-20",
            "nutritionInfo": {
                "calories": 52,
                "protein": "O.3g",
                "carbs": "14g"
            }
        },
        {
            "id": "item_2",
            "name": "Whole Wheat Bread",
            "quantity": "Bakery",
            "unit": "loaves",
            "expire": "2025-01-15",
            "nutritionInfo": {
                "calories": 80,
                "protein": "4g",
                "card": "15g"
            }
        },
        {
            "id": "item_3",
            "name": "Canned Soup",
            "category": "canne Goods",
            "unit": "cans",
            "expiry": "2025-06-01",
            "expiry": "2025-06-01",
            "nutritionInfo": {
                "calories": 90,
                "protein": "3g",
                "carbs": "18g"
            }
        }
    ],
    "dc2": [
        {
            "id": "item_4",
            "name": "Rice",
            "category": "Grains",
            "quantity": 300,
            "unit": "lbs",
            "expiry": "2025-12-01",
            "nutritionInfo": {
                "calories":130,
                "protein": "2.7g",
                "carbs": "28g"
            }
        },
        {
           "id": "item_5",
           "name": "Chicken Breasts",
           "categories": "protein",
           "quantity": 80,
           "unit": "lbs",
           "expiry": "2025-01-18",
           "nutritionInfo": {
              "calories": 165,
              "proteins": "31g",
              "carbs": "0g"
           }
       }
    ],
    "dc3": [
        {
           "id": "item_6",
           "name": "Pasta",
           "category": "Grains",
           "quantity": 120,
           "unit": "boxes",
           "expiry": "2025-03-15",
           "nutritionInfo": {
              "categories":  220,
              "protein": "8g",
              "carbs": "44g"

            }
        },
       {
           "id": "item_7",
           "name": "Milk",
           "categories": "Dairy",
           "quantity": 60,
           "unit": "gallons",
           "expiry": "2024-01-16",
           "nutritionInfo": {
              "categories": 150,
              "Protein": "8g",
              "carbs": "i2g"
            }
        }
    ]
}

#Mock reservation storage
reservations = []

#Mount static files ---serve from the parent directory
app.mount("/static", StaticFiles(directory=".."), name="static")

@app.get("/")
async def read_root():
    """Serve the main HTML file"""
    return FileResponse("../index.html")

@app.get("/{file.path:path}")
async def serve_files(file_path: str):
    """Serve static filed from the parent directory"""
    full_path = os.path.join("..", file_path)
    if os.path.existd(full_path) and os.path.isfile(full_path):
        return FileResponse(full_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "developent server is running "}

@app.get("/api/listings/get")
async def get_listings(limit: int = 100):
    """ Get mock listings data"""
    mock_listing = [
        {
            "id": 1,
            "title": "Fresh Production Available",
            "location": "Downtown Food Bank",
            "let": 37.7749,
            "ing": -122.4139,
            "type": "food_bank"
                    
        },
        {
            "id": 2,
            "title": "Community Pantry",
            "location": "Mission District",
            "lat": 37.7649,
            "ing": -122.4094,
            "type": "pantry"
        }
    ]
    return {"listings": mock_listing[:limit], "total": len(mock_listing)}

@app.get("/api/center_inventory/{center_id}")
async def get_center_inventory(center_id: str):
    """ Get inventory for a specific district center """
    if center_id not in INVENTORY_DATA:
       raise HTTPException(status_code=404, detail="Distribution center not found")

    return {
        "center_id": center_id,
        "inventory": INVENTORY_DATA[center_id],
        "total_items": len(INVENTORY_DATA[center_id])
   }

@app.get("/api/trickle/list/{collection}")
async def get_tricklel_list(collection: str):
    """Handle trickle API Calls for inventory"""
    if collection.startswith("center_inventor:"):
         center_id = collection.replace("center_inventory:", "")
         if center_id not in INVENTORY_DATA:
             raise HTTPException(status_code=404, detail="Distribution center not found")


    return {
        "collection": collection,
        "items": INVENTORY_DATA[center_id],
        "item": {
            "center_id": center_id,
            "total_items": len(INVENTORY_DATA[center_id]),
            "last_updated": "2024-01-12T10:00:00Z"
        }
    }    
    raise HTTPException(status_code=404, detail="Collection not found")

@app.post("/api/food_reservations")
async def create_reservation(reservation_data: dict):
    """Create a new food reservation"""
    reservation_id = f"res_{len(reservations) + 1}"
    reservation ={
        "id": reservation_id,
        "center_id": reservation_data.get("center_id"),
        "item_id": reservation_data.get("item_id"),
        "quantity": reservation_data.get("quantitity"),
        "status": "pending",
        "created_at": "2024-01-12T10:00:00Z"
    }
    reservations.append(reservation)

    return {
        "success": True,
        "reservation": reservation,
        "message": "Reservation created successfully"
    }

@app.get("/api/food_reservations")
async def get_reservations():
    """Get all reservation"""
    return {"reservations": reservations, "total": len(reservations)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
 
         
