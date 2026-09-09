import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BookingInput } from './booking';
import { deliverToPayload } from './bookingDelivery';

const data: BookingInput = {
  name: 'Tester',
  phone: '+420 123 456 789',
  service: 'Haircut',
  master: 'Any',
  date: '2999-01-02',
};

afterEach(() => vi.unstubAllGlobals());

describe('deliverToPayload', () => {
  it('POSTs the enquiry as JSON to /api/bookings and reports success on 2xx', async () => {
    const fetchMock = vi.fn(
      async (_url: URL | string, _init?: RequestInit) => new Response(null, { status: 201 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(deliverToPayload('http://cms.internal:3000', data)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(String(call?.[0])).toBe('http://cms.internal:3000/api/bookings');
    expect(call?.[1]?.method).toBe('POST');
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ ...data, source: 'website' });
  });

  it('reports failure on a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    );
    await expect(deliverToPayload('http://cms.internal:3000', data)).resolves.toBe(false);
  });

  it('reports failure when the request throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    await expect(deliverToPayload('http://cms.internal:3000', data)).resolves.toBe(false);
  });
});
