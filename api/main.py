from bson import ObjectId
from fastapi import FastAPI, HTTPException
from fastapi.params import Query
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware

from models import *

from typing import List

app = FastAPI()

# MongoDB Configuration
client = MongoClient("mongodb+srv://admin:admin123@cluster0.lbt5pzh.mongodb.net/")
db = client["supermarket_db"]
product_collection = db["products"]
storage_collection = db["storage"]
customer_collection = db["customers"]
payment_collection = db["payments"]
admin_collection = db['admin']


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500","*"],  # Replace with the URL of your frontend application
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ************ admin **************
@app.post("/admin/login",response_model=Admin)
def login(admin:Admin):
    user = admin_collection.find_one({"email": admin.email, "password": admin.password})
    if not user:
        raise HTTPException(status_code=401, detail="Login failed. Invalid credentials")
    return user


# ********** Customer ***********
@app.post("/customer/create", response_model=Customer)
def create_customer(customer: Customer):
    customer_data = customer.model_dump()
    cust_id = customer_collection.insert_one(customer_data).inserted_id
    customer_data["_id"] = str(cust_id)
    return customer_data

# Update a customer
@app.put("/customer/update/{cust_id}", response_model=Customer)
def update_customer(cust_id: str, customer: Customer):
    updated_customer = customer_collection.update_one({"_id": ObjectId(cust_id)}, {"$set": customer.dict()})
    if updated_customer.modified_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

# Delete a customer
@app.delete("/customer/delete/{cust_id}", response_model=dict)
def delete_customer(cust_id: str):
    deleted_customer = customer_collection.delete_one({"_id": ObjectId(cust_id)})
    if deleted_customer.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

@app.get("/api/customer/{mobile_no}")
def get_customer_by_mobile_no(mobile_no: str):
    customer = customer_collection.find_one({"cust_mobile_no": mobile_no})
    customer["_id"] = str(customer["_id"])
    if customer:
        return customer
    else:
        return {"message": "Customer not found"}

# Get a list of all customers
@app.get("/customer/getList")
def get_customer_list():
    customers = list(customer_collection.find())
    for customer in customers:
        customer['_id'] = str(customer['_id'])
    return customers

# Get customer details
@app.get("/customer/getOne/{cust_id}", response_model=Customer)
def get_customer_details(cust_id: str):
    customer = customer_collection.find_one({"_id": ObjectId(cust_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


# View purchase history for a customer
@app.get("/users/purchase-history/{user_id}", response_model=List[PaymentModel])
def see_purchase_history(user_id: str):
    payments = list(payment_collection.find({"cust_id": user_id}))
    return payments


# ******* Product ***********

@app.get("/product/getList")
def get_product_list():
    products = list(product_collection.find())
    for product in products:
        product["_id"] = str(product["_id"])
        storage_data = storage_collection.find_one({"p_id": str(product["_id"])})
        if storage_data:
            product["p_quantity"] = storage_data["quantity"]
        else:
            product["p_quantity"] = 0
    return list(products)


@app.post("/product/create", response_model=Product)
def create_product(product: Product):
    product_data = product.dict()
    product_id = product_collection.insert_one(product_data).inserted_id
    product_data["_id"] = str(product_id)

    storage_collection.insert_one({"p_id": str(product_id), "quantity": 0})

    return product_data


@app.put("/product/update/{product_id}", response_model=Product)
def update_product(product_id: str, product: Product):
    updated_product = product_collection.update_one({"_id": ObjectId(product_id)}, {"$set": product.dict()})
    if updated_product.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.delete("/product/delete/{product_id}", response_model=dict)
def delete_product(product_id: str):
    deleted_product = product_collection.delete_one({"_id": ObjectId(product_id)})
    if deleted_product.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    storage_collection.delete_one({"p_id": product_id})

    return {"message": "Product deleted successfully"}


@app.post("/product/addQty")
def add_product_quantity(storage:Storage):
    storage_data = storage_collection.find_one({"p_id": storage.p_id})
    print(storage_data)
    if storage_data:
        new_quantity = storage.quantity
        storage_collection.update_one({"p_id": storage.p_id}, {"$set": {"quantity": new_quantity}})
    else:
        raise HTTPException(status_code=404, detail="Product not found in storage")

    return {"p_id": storage.p_id, "quantity": new_quantity}

# ************* PaymentModel **************
# API Routes
@app.post("/payment/create", response_model=PaymentModel)
def create_payment(payment: PaymentModel):
    payment_data = payment.dict()
    payment_id = payment_collection.insert_one(payment_data).inserted_id
    payment_data["id"] = str(payment_id)
    return payment_data

@app.get("/payment/getList", response_model=List[PaymentModel])
def get_all_payments():
    payments = list(payment_collection.find())
    return payments

@app.get("/payment/getOne/{payment_id}", response_model=PaymentModel)
def get_payment(payment_id: str):
    payment = payment_collection.find_one({"_id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
