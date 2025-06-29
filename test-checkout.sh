#!/bin/bash

# Test curl command for Stripe checkout session
curl -X POST http://localhost:8787/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "Bio Supplement A",
        "image": "https://example.com/image1.jpg",
        "price": 29.99,
        "quantity": 2
      },
      {
        "name": "Bio Supplement B", 
        "image": "https://example.com/image2.jpg",
        "price": 45.50,
        "quantity": 1
      }
    ]
  }' 