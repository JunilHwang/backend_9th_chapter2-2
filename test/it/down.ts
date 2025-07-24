import { cleanupPrismaClient } from './util';

const down = async () => {
  await cleanupPrismaClient();
  if (global.mysql) {
    await global.mysql.stop();
  }
};

export default down;
