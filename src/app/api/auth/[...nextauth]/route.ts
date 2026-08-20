import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          await connectDB()
          const member = await Member.findOne({ 
            email: credentials.email.toLowerCase(),
            subscriptionStatus: 'active'
          })
          if (!member) return null
          if (!member.passwordHash) return null
          const valid = await bcrypt.compare(credentials.password, member.passwordHash)
          if (!valid) return null
          return {
            id: member._id.toString(),
            email: member.email,
            name: member.fullName,
            image: member.profilePicture || null,
          }
        } catch (e) {
          return null
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
