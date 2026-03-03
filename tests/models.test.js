const db = require('../src/config/db');
const Product = require('../src/models/productModel');
const User = require('../src/models/userModel');
const Order = require('../src/models/orderModel');
const Cart = require('../src/models/cartModel');

describe('Model Tests', () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    test('Product model should fetch all products', async () => {
        const products = await Product.getAllProducts();
        expect(Array.isArray(products)).toBe(true);
    });

    test('User model should create a new user', async () => {
        const user = await User.createUser({ username: 'testuser', password: 'password' });
        expect(user).toHaveProperty('id');
    });

    test('Order model should create a new order', async () => {
        const order = await Order.createOrder({ userId: 1, total: 100 });
        expect(order).toHaveProperty('id');
    });

    test('Cart model should add item to cart', async () => {
        const cartItem = await Cart.addItemToCart({ userId: 1, productId: 1, quantity: 1 });
        expect(cartItem).toHaveProperty('id');
    });
});