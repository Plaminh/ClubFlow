import { z } from 'zod';

const nonBlank = (message) => z.string().refine((value) => value.trim().length > 0, message);

export const loginBody = z.object({
  username: z.string().trim().min(1, 'Username is required.'),
  password: nonBlank('Password is required.'),
});

export const updateProfileBody = z.object({
  displayName: z.string().trim().min(1, 'Display name is required.'),
  email: z.string().trim().email('A valid e-mail address is required.'),
});
