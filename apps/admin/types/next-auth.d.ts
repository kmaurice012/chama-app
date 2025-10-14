import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    chamaId: string;
    chamaName: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      chamaId: string;
      chamaName: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    chamaId: string;
    chamaName: string;
  }
}
