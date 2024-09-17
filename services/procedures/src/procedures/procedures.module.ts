import { Module } from '@nestjs/common';
import { ProceduresController } from './procedures.controller';
import { ProceduresService } from './procedures.service';
import { MongooseModule } from '@nestjs/mongoose';
import ProcedureSchema from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Procedure', schema: ProcedureSchema }]),
  ],
  controllers: [ProceduresController],
  providers: [ProceduresService],
})
export class ProceduresModule {}
