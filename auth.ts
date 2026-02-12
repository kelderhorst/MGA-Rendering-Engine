import NextAuth from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? '',
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
});
