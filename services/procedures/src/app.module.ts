import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProceduresModule } from './procedures/procedures.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigifyModule } from '@itgorillaz/configify';
import { DatabaseConfiguration } from './config/database.configuration';

@Module({
  imports: [
    ProceduresModule,
    MongooseModule.forRootAsync({
      inject: [DatabaseConfiguration],
      useFactory: async (config: DatabaseConfiguration) => ({
        uri: config.dbUrl,
      }),
    }),
    ConfigifyModule.forRootAsync(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
