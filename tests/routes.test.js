const request = require('supertest');
const app = require('../src/app'); // Adjust the path as necessary

describe('Route Tests', () => {
    it('should return the home page', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Welcome to the E-Commerce App');
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'testpassword',
                email: 'testuser@example.com'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should fetch products', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should add a product to the cart', async () => {
        const res = await request(app)
            .post('/api/cart')
            .send({
                productId: 1,
                quantity: 2
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Product added to cart');
    });

    it('should place an order', async () => {
        const res = await request(app)
            .post('/api/orders')
            .send({
                cartId: 1,
                userId: 1
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Order placed successfully');
    });
});