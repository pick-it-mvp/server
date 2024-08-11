export default () => {
  return {
    env: process.env.NODE_ENV || 'dev',
    port: parseInt(process.env.PORT, 10) || 4000,
    database: process.env.DATABASE_URL,
    client: process.env.CLIENT_URL,
    server: process.env.SERVER_URL,
    redis: process.env.REDIS_URL,
    naver_client: process.env.NAVER_CLIENT,
    naver_secret: process.env.NAVER_SECRET,
  };
};
