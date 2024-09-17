import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProceduresModule } from './procedures/procedures.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ProceduresModule,
    MongooseModule.forRoot('mongodb://localhost:27017/bundestagio'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
