import csurf from 'csurf';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const csrfProtection = csurf({
  cookie: {
    httpOnly: false,
    sameSite: 'strict',
  },
});
