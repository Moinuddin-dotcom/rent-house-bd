export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  aws: {
    region: process.env.AWS_REGION ?? 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.AWS_S3_BUCKET ?? '',
    publicUrl: process.env.AWS_S3_PUBLIC_URL ?? '',
  },
  sms: {
    // HTTP gateway URL with {to} and {message} placeholders (see .env.example)
    apiUrl: process.env.SMS_API_URL ?? '',
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID ?? '',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET ?? '',
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN ?? '',
    privacyStatus: process.env.YOUTUBE_PRIVACY_STATUS ?? 'unlisted',
  },
});
