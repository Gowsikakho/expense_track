import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Simple demo auth - replace with real validation
        if (credentials?.email && credentials?.password) {
          return {
            id: '1',
            email: credentials.email,
            name: credentials.email.split('@')[0]
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt'
  }
})

export { handler as GET, handler as POST }