import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGemini } from '../hooks/useGemini';

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

describe('useGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useGemini());
    
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it.skip('should initiate analysis when analyze is called', async () => {
    // Set a valid API key in localStorage
    mockLocalStorage.setItem('gemini_api_key', 'AIzaSyTestKey123456789012345678901234567890');

    const { result } = renderHook(() => useGemini());

    // Initially, isAnalyzing should be false
    expect(result.current.isAnalyzing).toBe(false);

    // Call analyze - this should start the analysis process
    const analyzePromise = result.current.analyze('Test content');

    // Wait for the analysis to complete
    await analyzePromise;

    // At the end of the process, isAnalyzing should be false again (analysis completed)
    expect(result.current.isAnalyzing).toBe(false);

    // And result should be populated
    expect(result.current.result).not.toBeNull();
  });

  it('should return error if API key is missing', async () => {
    const { result } = renderHook(() => useGemini());
    
    // Call analyze without setting API key
    await result.current.analyze('Test content');
    
    await waitFor(() => {
      expect(result.current.error).toBe('API Key missing. Please set your API key in the settings.');
    });
  });

  it('should return error if API key does not start with AIza', async () => {
    // Set an invalid API key in localStorage
    mockLocalStorage.setItem('gemini_api_key', 'InvalidKeyFormat');
    
    const { result } = renderHook(() => useGemini());
    
    // Call analyze
    await result.current.analyze('Test content');
    
    await waitFor(() => {
      expect(result.current.error).toBe('Invalid Key Format: API key must start with \'AIza\'.');
    });
  });

  it('should return error if API key is too short', async () => {
    // Set an API key that starts with AIza but is too short
    mockLocalStorage.setItem('gemini_api_key', 'AIzaShort');
    
    const { result } = renderHook(() => useGemini());
    
    // Call analyze
    await result.current.analyze('Test content');
    
    await waitFor(() => {
      expect(result.current.error).toBe('Invalid Key Format: API key appears to be too short.');
    });
  });

  it('should populate result state with successful analysis', async () => {
    // Set a valid API key in localStorage
    mockLocalStorage.setItem('gemini_api_key', 'AIzaSyTestKey123456789012345678901234567890');
    
    const { result } = renderHook(() => useGemini());
    
    // Call analyze
    await result.current.analyze('Test content');
    
    await waitFor(() => {
      expect(result.current.result).not.toBeNull();
      expect(result.current.result).toHaveProperty('summary');
      expect(result.current.result).toHaveProperty('overallRiskScore');
    });
  });

  it('should handle errors during analysis', async () => {
    // Set a valid API key in localStorage
    mockLocalStorage.setItem('gemini_api_key', 'AIzaSyTestKey123456789012345678901234567890');
    
    // Mock sendMessage to throw an error
    const { getGeminiModel } = await import('@/lib/gemini');
    const mockSendMessage = vi.fn(() => Promise.reject(new Error('API Error')));
    vi.mocked(getGeminiModel).mockReturnValue({
      sendMessage: mockSendMessage,
    } as any);
    
    const { result } = renderHook(() => useGemini());
    
    // Call analyze
    await result.current.analyze('Test content');
    
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toContain('API Error');
    });
  });

  it('should reset error and result when starting new analysis', async () => {
    // Set a valid API key in localStorage
    mockLocalStorage.setItem('gemini_api_key', 'AIzaSyTestKey123456789012345678901234567890');
    
    const { result } = renderHook(() => useGemini());
    
    // Initially, result and error should be null
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    
    // Call analyze
    await result.current.analyze('Test content');
    
    await waitFor(() => {
      expect(result.current.error).toBeNull(); // Error should be reset when analysis starts
    });
  });
});