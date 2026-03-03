# API Documentation

## Base URL
The base URL for all API endpoints is: `http://localhost:3000/api`

## Authentication

### Register User
- **Endpoint:** `POST /auth/register`
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - **201 Created**
    ```json
    {
      "message": "User registered successfully."
    }
    ```
  - **400 Bad Request**
    ```json
    {
      "error": "User already exists."
    }
    ```

### Login User
- **Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - **200 OK**
    ```json
    {
      "token": "string",
      "user": {
        "id": "number",
        "username": "string",
        "email": "string"
      }
    }
    ```
  - **401 Unauthorized**
    ```json
    {
      "error": "Invalid credentials."
    }
    ```

## Products

### Get All Products
- **Endpoint:** `GET /products`
- **Response:**
  - **200 OK**
    ```json
    [
      {
        "id": "number",
        "name": "string",
        "price": "number",
        "description": "string",
        "image": "string"
      }
    ]
    ```

### Get Product by ID
- **Endpoint:** `GET /products/:id`
- **Response:**
  - **200 OK**
    ```json
    {
      "id": "number",
      "name": "string",
      "price": "number",
      "description": "string",
      "image": "string"
    }
    ```
  - **404 Not Found**
    ```json
    {
      "error": "Product not found."
    }
    ```

## Cart

### Get Cart Items
- **Endpoint:** `GET /cart`
- **Response:**
  - **200 OK**
    ```json
    [
      {
        "productId": "number",
        "quantity": "number"
      }
    ]
    ```

### Add Item to Cart
- **Endpoint:** `POST /cart`
- **Request Body:**
  ```json
  {
    "productId": "number",
    "quantity": "number"
  }
  ```
- **Response:**
  - **201 Created**
    ```json
    {
      "message": "Item added to cart."
    }
    ```

### Update Cart Item
- **Endpoint:** `PUT /cart/:id`
- **Request Body:**
  ```json
  {
    "quantity": "number"
  }
  ```
- **Response:**
  - **200 OK**
    ```json
    {
      "message": "Cart item updated."
    }
    ```

### Remove Item from Cart
- **Endpoint:** `DELETE /cart/:id`
- **Response:**
  - **200 OK**
    ```json
    {
      "message": "Item removed from cart."
    }
    ```

## Orders

### Place Order
- **Endpoint:** `POST /orders`
- **Request Body:**
  ```json
  {
    "cartItems": [
      {
        "productId": "number",
        "quantity": "number"
      }
    ],
    "shippingAddress": "string"
  }
  ```
- **Response:**
  - **201 Created**
    ```json
    {
      "message": "Order placed successfully.",
      "orderId": "number"
    }
    ```

### Get Order by ID
- **Endpoint:** `GET /orders/:id`
- **Response:**
  - **200 OK**
    ```json
    {
      "id": "number",
      "items": [
        {
          "productId": "number",
          "quantity": "number"
        }
      ],
      "status": "string"
    }
    ```
  - **404 Not Found**
    ```json
    {
      "error": "Order not found."
    }
    ```

## Error Handling
All error responses will have a consistent format:
```json
{
  "error": "string"
}
```