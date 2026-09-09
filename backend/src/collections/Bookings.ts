import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

/** Mirrors the frontend check in frontend/src/lib/booking.ts. */
const PHONE_RE = /^[+0-9 ()-]{9,20}$/;

export const BOOKING_STATUSES = ['new', 'confirmed', 'cancelled'] as const;

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: 'Booking', plural: 'Bookings' },
  access: {
    // The public booking form (frontend `/booking`) posts here. Reading and
    // managing enquiries is staff-only.
    create: anyone,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'service', 'date', 'status', 'createdAt'],
    group: 'Enquiries',
  },
  defaultSort: '-createdAt',
  hooks: {
    beforeChange: [
      ({ operation, data }) => {
        // An anonymous create can't choose its own status or forge the source.
        if (operation === 'create') {
          return { ...data, status: 'new', source: 'website' };
        }
        return data;
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 100 },
    {
      name: 'phone',
      type: 'text',
      required: true,
      validate: (value: unknown) =>
        (typeof value === 'string' && PHONE_RE.test(value)) ||
        'Enter a phone number (9–20 chars: digits, spaces, + ( ) -).',
    },
    { name: 'service', type: 'text', required: true, maxLength: 100 },
    { name: 'master', type: 'text', maxLength: 100 },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' } },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'website',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
};
