describe('Simple Test Suite', () => {
  test('basic math works', () => {
    expect(2 + 2).toBe(4);
  });

  test('strings work', () => {
    expect('hello world').toContain('world');
  });

  test('arrays work', () => {
    const items = [1, 2, 3];
    expect(items).toHaveLength(3);
  });
});