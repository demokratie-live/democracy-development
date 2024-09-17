import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectModel('Procedure') private procedureModel: typeof ProcedureModel,
  ) {}

  async findAll() {
    const procedures = await this.procedureModel.find();
    return procedures[0];
  }
}
