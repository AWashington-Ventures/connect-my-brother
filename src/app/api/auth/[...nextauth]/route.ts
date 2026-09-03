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
            // Never embed base64 images in JWT — only pass HTTP/HTTPS URLs to avoid cookie overflow
            image: (member.profilePicture && typeof member.profilePicture === 'string' && member.profilePicture.startsWith('http')) ? member.profilePicture : null,
            // Founding member fields for middleware enforcement
            freeUntil: member.freeUntil ? member.freeUntil.toISOString() : null,
            hasActiveSubscription: !!(member.stripeSubscriptionId),
            mustChangePassword: !!(member.mustChangePassword),
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
      if (user) {
        token.id = user.id
        token.freeUntil = (user as any).freeUntil ?? null
        token.hasActiveSubscription = (user as any).hasActiveSubscription ?? false
        token.mustChangePassword = (user as any).mustChangePassword ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).freeUntil = token.freeUntil ?? null
        ;(session.user as any).hasActiveSubscription = token.hasActiveSubscription ?? false
        ;(session.user as any).mustChangePassword = token.mustChangePassword ?? false
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
