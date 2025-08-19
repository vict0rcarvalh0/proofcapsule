// Basic test to ensure CI pipeline works
describe('Basic Tests', () => {
  test('should pass basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  test('should handle string operations', () => {
    const message = 'Hello, ProofCapsule!'
    expect(message).toContain('ProofCapsule')
  })

  test('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
  })
}) 