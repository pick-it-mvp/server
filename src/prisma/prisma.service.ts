import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        // {
        //   emit: "stdout",
        //   level: "query",
        // },
        // {
        //   emit: "event",
        //   level: "error",
        // },
        // {
        //   emit: "event",
        //   level: "info",
        // },
        // {
        //   emit: "event",
        //   level: "warn",
        // },
      ],
    });

    // this.$on("query", (e) => {
    //   e.query = JSON.parse(JSON.stringify(e.query));
    //   this.logger.log(e);
    // });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
