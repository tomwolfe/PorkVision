import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { extractJson } from '../lib/parser';

// Define a test schema for validation
const TestSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email().optional(),
});

type TestType = z.infer<typeof TestSchema>;

describe('extractJson', () => {
  it('should extract and validate valid JSON', () => {
    const input = '{"name": "John", "age": 30}';
    const result = extractJson<TestType>(input, TestSchema);
    
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should extract JSON from markdown code blocks', () => {
    const input = '```json\n{"name": "Jane", "age": 25}\n```';
    const result = extractJson<TestType>(input, TestSchema);
    
    expect(result).toEqual({ name: 'Jane', age: 25 });
  });

  it('should extract JSON from markdown code blocks without language specifier', () => {
    const input = '```\n{"name": "Bob", "age": 35}\n```';
    const result = extractJson<TestType>(input, TestSchema);
    
    expect(result).toEqual({ name: 'Bob', age: 35 });
  });

  it('should handle JSON with leading conversational text', () => {
    const input = 'Here is the result: {"name": "Alice", "age": 28}';
    const result = extractJson<TestType>(input, TestSchema);
    
    expect(result).toEqual({ name: 'Alice', age: 28 });
  });

  it('should handle JSON with trailing conversational text', () => {
    const input = '{"name": "Charlie", "age": 32} This is the final result.';
    const result = extractJson<TestType>(input, TestSchema);
    
    expect(result).toEqual({ name: 'Charlie', age: 32 });
  });

  it('should handle JSON with both leading and trailing conversational text', () => {
    const input = 'Here is your data: {"name": "David", "age": 40}. Please review.';
    const result = extractJson<TestType>(input, TestSchema);
    
    expect(result).toEqual({ name: 'David', age: 40 });
  });

  it('should remove trailing commas inside objects', () => {
    const input = '{"name": "Eve", "age": 30,}';
    const result = extractJson<TestType>(input, TestSchema);
    
    expect(result).toEqual({ name: 'Eve', age: 30 });
  });

  it('should remove trailing commas inside arrays', () => {
    const ArraySchema = z.object({
      items: z.array(z.string()),
    });
    
    const input = '{"items": ["a", "b",],}';
    const result = extractJson(input, ArraySchema);
    
    expect(result).toEqual({ items: ["a", "b"] });
  });

  it('should handle nested objects with trailing commas', () => {
    const NestedSchema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number(),
      }),
      active: z.boolean(),
    });
    
    const input = '{"user": {"name": "Frank", "age": 45,}, "active": true,}';
    const result = extractJson(input, NestedSchema);
    
    expect(result).toEqual({ user: { name: 'Frank', age: 45 }, active: true });
  });

  it('should throw an error when no JSON structure is found', () => {
    const input = 'This is just plain text without any JSON';
    
    expect(() => extractJson<TestType>(input, TestSchema)).toThrow(
      'No valid JSON structure detected in AI response.'
    );
  });

  it('should throw a ZodError when validation fails', () => {
    const input = '{"name": "Grace", "age": "thirty"}'; // age should be a number
    
    expect(() => extractJson<TestType>(input, TestSchema)).toThrow(
      /age.*expected number/
    );
  });

  it('should handle complex nested structures with markdown', () => {
    const ComplexSchema = z.object({
      users: z.array(z.object({
        id: z.number(),
        profile: z.object({
          name: z.string(),
          contact: z.object({
            email: z.string().email(),
            phone: z.string().optional(),
          }),
        }),
      })),
    });
    
    const input = `Here is the data:
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "profile": {
        "name": "Helen",
        "contact": {
          "email": "helen@example.com",
          "phone": "+1234567890"
        }
      }
    },
    {
      "id": 2,
      "profile": {
        "name": "Ian",
        "contact": {
          "email": "ian@example.com",
        }
      }
    }
  ]
}
\`\`\`

Please review the data carefully.`;

    const result = extractJson(input, ComplexSchema);
    
    expect(result).toEqual({
      users: [
        {
          id: 1,
          profile: {
            name: 'Helen',
            contact: {
              email: 'helen@example.com',
              phone: '+1234567890'
            }
          }
        },
        {
          id: 2,
          profile: {
            name: 'Ian',
            contact: {
              email: 'ian@example.com',
            }
          }
        }
      ]
    });
  });

  it('should handle JSON with extra whitespace and formatting', () => {
    const input = `
    
    Here's the JSON response:
    
    {
      "name":   "Jack"  , 
      "age" : 50
    }
    
    That's all the info.
    `;
    
    const result = extractJson<TestType>(input, TestSchema);
    
    expect(result).toEqual({ name: 'Jack', age: 50 });
  });

  it('should handle JSON with mixed quote types (single and double)', () => {
    // Note: This test expects failure since JSON only allows double quotes
    const input = `{"name": 'Jack', "age": 50}`;

    expect(() => extractJson<TestType>(input, TestSchema)).toThrow(SyntaxError);
  });

  it('should correctly extract the largest valid JSON object when multiple exist', () => {
    // Input contains two JSON objects that match TestSchema - a small one and a larger one with additional fields
    // The parser should select the larger one based on string length
    const input = `{"name": "Small", "age": 20} {"name": "Larger", "age": 25, "email": "larger@example.com"}`;

    const result = extractJson(input, TestSchema);

    // Should pick the larger JSON object (with email field) even though email is optional in TestSchema
    // The parsed result will include the email field if it's valid, but TestSchema only validates name and age
    // Since email is optional in TestSchema, it should be included in the parsed result
    expect(result).toEqual({
      name: "Larger",
      age: 25,
      email: "larger@example.com"
    });
  });
});