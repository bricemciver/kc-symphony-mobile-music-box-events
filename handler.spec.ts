import { describe, expect, it, vi } from 'vitest';
import worker from './handler';

describe('cloudflare worker', () => {
  it('should return events from the page', async () => {
    // Mock the fetch function
    const mockFetch = vi.fn<typeof fetch>();
    globalThis.fetch = mockFetch;

    // Mock response from KC Symphony website - matching the real format
    const htmlContent = `
      <html>
        <body>
          <a class="accordion-toggle">Concert Calendar</a>
          <div class="accordion-content">
            <p>Saturday, May 15, 2026 at 7:00PM<br>Kauffman Center for the Performing Arts - 1 Broadway Blvd, Kansas City, MO 64105<br>Sponsored by Kansas City Symphony Guild</p>
          </div>
        </body>
      </html>
    `;

    console.log('Mock HTML:', htmlContent);

    // Properly mock Response object
    mockFetch.mockResolvedValueOnce(
      new Response(htmlContent, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }),
    );

    // Create a mock request
    const request = new Request('https://example.com/');
    const env = {};
    const ctx = {};

    // Call the worker
    const response = await worker.fetch(request, env, ctx);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const json = await response.json();
    console.log('Events returned:', json.events);
    expect(json.events).toHaveLength(1);
    expect(json.events[0].date).toMatch(/2026-05-15/);
    expect(json.events[0].location).toBe('Kauffman Center for the Performing Arts');
    expect(json.events[0].address).toBe('1 Broadway Blvd, Kansas City, MO 64105');
    expect(json.events[0].sponsor).toBe('Kansas City Symphony Guild');

    // Verify fetch was called with correct URL
    expect(mockFetch).toHaveBeenCalledWith('https://www.kcsymphony.org/concerts-tickets/neighborhood-concerts/');
  });

  it('should handle errors gracefully', async () => {
    // Mock fetch to return an error
    const mockFetch = vi.fn<typeof fetch>();
    globalThis.fetch = mockFetch;

    // Properly mock Response object for error
    mockFetch.mockResolvedValueOnce(
      new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      }),
    );

    const request = new Request('https://example.com/');
    const env = {};
    const ctx = {};

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const json = await response.json();
    expect(json.error).toContain('HTTP error! status: 404');
  });
});
