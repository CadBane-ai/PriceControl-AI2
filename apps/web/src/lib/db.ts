// Temporary stub for database client to allow builds/linting.
export const db = {
  query: {
    users: {
      async findFirst(_: unknown) {
        return null as any;
      },
    },
  },
} as const;

