import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {unoptimized: true},
  // firebase-admin must stay a runtime dependency of the server, not bundled.
  serverExternalPackages: ['firebase-admin'],
}

export default withNextIntl(nextConfig)
