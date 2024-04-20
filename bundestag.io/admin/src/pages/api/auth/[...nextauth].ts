import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Personal Data',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'username' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        let user: any = null;
        const users = process.env.CREDENTIALS!.split('|').map((userCreds) => {
          const [username, password] = userCreds.split(':');
          return { username: username.trim(), password: password.trim() };
        });

        user = users.find(
          ({ username, password }) =>
            username.toLowerCase() === credentials?.username.toLowerCase() && password === credentials?.password,
        );

        // If no error and we have user data, return it
        if (user) {
          return { name: user.username, id: user.username };
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
};

export default NextAuth(authOptions);
