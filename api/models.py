from pydantic import BaseModel
from typing import List, Union


class Customer(BaseModel):
    cust_name: str
    cust_mobile_no: str
    cust_address: str


class Product(BaseModel):
    _id: Union[str, None] = None
    p_name: str
    p_price: float
    p_brand: str


class Storage(BaseModel):
    p_id: str
    quantity: str


class ProductItem(BaseModel):
    prod_id: str
    prod_name: str
    prod_price: float
    prod_quantity: int


class PaymentModel(BaseModel):
    id: Union[str, None] = None
    pay_amount: float
    prod: List[ProductItem]


class Admin(BaseModel):
    email: str
    password: str
