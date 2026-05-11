const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Order = require('../orders');
const Product = require('../products');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await Product.deleteMany({});
});

describe('Orders API Tests', () => {

  test('POST /api/orders - creates new order', async () => {
    const product = await Product.create({
      name: 'Test Product',
      price: 29.99,
      category: 'Test'
    });

    const orderData = {
      items: [{
        productId: product._id,
        quantity: 2,
        price: 29.99
      }],
      customerInfo: {
        name: 'John Doe',
        email: 'john@test.com',
        address: '123 Test St'
      }
    };

    const response = await request(app)
      .post('/api/orders')
      .send(orderData)
      .expect(201);

    expect(response.body.customerInfo.name).toBe('John Doe');
    expect(response.body.totalAmount).toBe(59.98);
  });

  test('GET /api/orders - returns all orders', async () => {
    const product = await Product.create({
      name: 'Test Product',
      price: 10,
      category: 'Test'
    });

    await Order.create({
      items: [{ productId: product._id, quantity: 1, price: 10 }],
      customerInfo: { name: 'Customer 1', email: 'c1@test.com', address: '123 St' },
      totalAmount: 10
    });

    const response = await request(app)
      .get('/api/orders')
      .expect(200);

    expect(response.body).toHaveLength(1);
  });
});