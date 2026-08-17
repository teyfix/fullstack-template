Object.assign(process.env, {
  APP_NAME: "journal",
  BETTER_AUTH_SECRET: "test-secret-with-at-least-thirty-two-characters",
  BETTER_AUTH_URL: "http://localhost:3000",
  IMGPROXY_KEY:
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  IMGPROXY_SALT: "abcdef0123456789abcdef0123456789",
  IMGPROXY_URL: "http://localhost:8080",
  NODE_ENV: "test",
  POSTGRES_ADMIN_URL: "postgresql://test:test@localhost:5432/test",
  POSTGRES_URL: "postgresql://test:test@localhost:5432/test",
  REDIS_URL: "redis://localhost:6379",
  S3_ACCESS_KEY: "test",
  S3_BUCKET: "test",
  S3_ENDPOINT: "http://localhost:9000",
  S3_REGION: "us-east-1",
  S3_SECRET_KEY: "test",
  VITE_APP_NAME: "Teyfix Journal",
});
