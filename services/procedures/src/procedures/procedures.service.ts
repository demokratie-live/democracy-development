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

  async fetchUpcomingProcedures() {
    return await this.procedureModel
      .find({
        $or: [
          {
            $and: [
              { voteDate: { $gte: new Date() } },
              {
                $or: [{ voteEnd: { $exists: false } }, { voteEnd: undefined }],
              },
            ],
          },
          { voteEnd: { $gte: new Date() } },
        ],
      })
      .sort({ voteDate: 1, voteEnd: 1, votes: -1 });
  }

  async fetchPastProcedures() {
    return await this.procedureModel
      .find({
        $or: [
          { voteDate: { $lt: new Date() } },
          { voteEnd: { $lt: new Date() } },
        ],
      })
      .sort({ voteDate: -1, voteEnd: -1, votes: -1 });
  }
}
