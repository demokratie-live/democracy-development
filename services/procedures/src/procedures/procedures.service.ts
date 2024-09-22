import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectModel('Procedure') private procedureModel: typeof ProcedureModel,
  ) {}

  async findAll({ page, limit }: { page: number; limit: number }) {
    const procedures = await this.procedureModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await this.procedureModel.countDocuments();

    return { procedures, count };
  }

  async fetchUpcomingProcedures({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }) {
    const filter = {
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
    };
    const procedures = await this.procedureModel
      .find(filter)
      .sort({ voteDate: 1, voteEnd: 1, votes: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await this.procedureModel.countDocuments(filter);

    return { procedures, count };
  }

  async fetchPastProcedures({ page, limit }: { page: number; limit: number }) {
    const filter = {
      $or: [
        { voteDate: { $lt: new Date() } },
        { voteEnd: { $lt: new Date() } },
      ],
    };
    const procedures = await this.procedureModel
      .find(filter)
      .sort({ voteDate: -1, voteEnd: -1, votes: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await this.procedureModel.countDocuments(filter);

    return { procedures, count };
  }
}
