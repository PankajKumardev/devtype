import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      username?: string;
      email: string;
      image?: string;
      stats?: {
        testsCompleted: number;
        bestWpm: number;
        avgAccuracy: number;
      };
    };
  }
}
