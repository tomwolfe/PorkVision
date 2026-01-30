import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGemini } from '@/hooks/useGemini';

// Mock the modules used in the hook
vi.mock('@/lib/gemini', async () => {
  const actual = await vi.importActual('@/lib/gemini');
  return {
    ...actual,
    getGeminiModel: vi.fn(() => ({
      sendMessage: vi.fn(() => Promise.resolve({ text: '{"porkBarrel": [], "lobbyistFingerprints": [], "contradictions": [], "economicImpact": {"debtImpact": "", "longTermOutlook": ""}, "overallRiskScore": 0, "summary": "Test summary"}' })),
    })),
    getAnalysisPrompt: vi.fn(() => 'Test prompt'),
  };
});

vi.mock('@/lib/parser', async () => {
  const actual = await vi.importActual('@/lib/parser');
  return {
    ...actual,
    extractJson: vi.fn((text, schema) => {
      // Simulate successful parsing by returning a valid object
      return JSON.parse(text);
    }),
  };
});

vi.mock('@/lib/schema', async () => {
  const actual = await vi.importActual('@/lib/schema');
  return {
    ...actual,
    AuditResultSchema: actual.AuditResultSchema, // Preserve the actual schema
  };
});

// Mock localStorage for Node environment
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Check if running in browser environment (window exists) or Node.js
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
} else {
  // For Node.js environment, attach to global
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('should handle 429 quota exceeded error with retry logic', async () => {
    // Set a valid API key in localStorage
    mockLocalStorage.setItem('gemini_api_key', 'AIzaSyTestKey123456789012345678901234567890');

    // For URL content, the system first tries with tools enabled, then if there's a 429,
    // it falls back to tools disabled, and if still getting 429, retries with backoff
    const mockSendMessage = vi.fn()
      .mockRejectedValueOnce(new Error('429 Quota Exceeded')) // First call (with tools) gets 429
      .mockRejectedValueOnce(new Error('429 Quota Exceeded')) // Second call (without tools) gets 429
      .mockResolvedValueOnce({ text: '{"porkBarrel": [], "lobbyistFingerprints": [], "contradictions": [], "economicImpact": {"debtImpact": "", "longTermOutlook": ""}, "overallRiskScore": 0, "summary": "Retry successful"}' }); // Third call succeeds

    const { getGeminiModel } = await import('@/lib/gemini');
    vi.mocked(getGeminiModel).mockReturnValue({
      sendMessage: mockSendMessage,
    } as any);

    const { result } = renderHook(() => useGemini());

    // Call analyze function with URL content to trigger the specific flow
    await result.current.analyze('https://example.com/bill-content');

    // Wait for the process to complete
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    }, { timeout: 10000 });

    // Verify that sendMessage was called three times (first with tools, second without tools, third retry)
    expect(mockSendMessage).toHaveBeenCalledTimes(3);

    // Verify that the result was set properly after the successful retry
    expect(result.current.result).not.toBeNull();
    expect(result.current.result?.summary).toBe('Retry successful');
  });

  it('should maintain isAnalyzing state during retry delay', async () => {
    // Set a valid API key in localStorage
    mockLocalStorage.setItem('gemini_api_key', 'AIzaSyTestKey123456789012345678901234567890');

    // Mock sendMessage to reject first call with 429 (after tool fallback), and succeed on second call
    const mockSendMessage = vi.fn()
      .mockRejectedValueOnce(new Error('429 Quota Exceeded')) // First call (with tools) gets 429
      .mockRejectedValueOnce(new Error('429 Quota Exceeded')) // Second call (without tools) gets 429
      .mockResolvedValueOnce({ text: '{"porkBarrel": [], "lobbyistFingerprints": [], "contradictions": [], "economicImpact": {"debtImpact": "", "longTermOutlook": ""}, "overallRiskScore": 0, "summary": "Retry successful"}' }); // Third call succeeds

    const { getGeminiModel } = await import('@/lib/gemini');
    vi.mocked(getGeminiModel).mockReturnValue({
      sendMessage: mockSendMessage,
    } as any);

    const { result } = renderHook(() => useGemini());

    // Initially, isAnalyzing should be false
    expect(result.current.isAnalyzing).toBe(false);

    // Start the analysis with URL content to trigger the specific flow
    const analyzePromise = result.current.analyze('https://example.com/bill-content');

    // Wait for the isAnalyzing state to become true
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(true);
    });

    // Wait for the process to complete
    await analyzePromise;

    // Wait for the state to update to false when complete
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    }, { timeout: 10000 });

    // Verify that sendMessage was called three times (first with tools, second without tools, third retry)
    expect(mockSendMessage).toHaveBeenCalledTimes(3);
  });
});