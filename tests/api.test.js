import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProblems, fetchProblemData, generateTraceData } from '../src/services/api';

describe('API Service', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('fetchProblems returns problems', async () => {
    const mockData = [{ slug: 'two-sum', title: 'Two Sum' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchProblems();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/problems');
  });

  it('fetchProblemData throws on 404', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await expect(fetchProblemData('unknown')).rejects.toThrow('Problem not in registry');
  });

  it('generateTraceData sends correct payload', async () => {
    const mockResponse = { steps: [] };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await generateTraceData('two-sum', 'my code', 'Python');
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'two-sum', userCode: 'my code', language: 'Python' })
    });
  });
});
