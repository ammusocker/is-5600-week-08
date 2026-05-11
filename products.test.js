const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
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
  await Product.deleteMany({});
});

describe('Products API Tests', () => {

  test('GET /api/products - returns all products', async () => {
    await Product.create([
      { name: 'Product 1', price: 10, category: 'Test' },
      { name: 'Product 2', price: 20, category: 'Test' }
    ]);

    const response = await request(app)
      .get('/api/products')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Product 1');
  });

  test('GET /api/products/:id - returns specific product', async () => {
    const product = await Product.create({
      name: 'Test Product',
      price: 15.99,
      category: 'Electronics'
    });

    const response = await request(app)
      .get(`/api/products/${product._id}`)
      .expect(200);

    expect(response.body.name).toBe('Test Product');
    expect(response.body.price).toBe(15.99);
  });

  test('POST /api/products - creates new product', async () => {
    const newProduct = {
      name: 'New Product',
      price: 25.99,
      category: 'Books'
    };

    const response = await request(app)
      .post('/api/products')
      .send(newProduct)
      .expect(201);

    expect(response.body.name).toBe('New Product');
    expect(response.body.price).toBe(25.99);
  });

  test('PUT /api/products/:id - updates product', async () => {
    const product = await Product.create({
      name: 'Original',
      price: 10,
      category: 'Test'
    });

    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .send({ name: 'Updated', price: 20 })
      .expect(200);

    expect(response.body.name).toBe('Updated');
    expect(response.body.price).toBe(20);
  });

  test('DELETE /api/products/:id - deletes product', async () => {
    const product = await Product.create({
      name: 'To Delete',
      price: 5,
      category: 'Test'
    });

    await request(app)
      .delete(`/api/products/${product._id}`)
      .expect(200);

    const deleted = await Product.findById(product._id);
    expect(deleted).toBeNull();
  });
});