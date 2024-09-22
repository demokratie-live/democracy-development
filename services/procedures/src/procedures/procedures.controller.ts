import { Controller, Get } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { Pagination } from '../decorators/pagination';

@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}
  @Get()
  findAll(@Pagination() pagination: { page: number; limit: number }) {
    return this.proceduresService.findAll({
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get('list/upcoming')
  upcomingProcedures(
    @Pagination() pagination: { page: number; limit: number },
  ) {
    return this.proceduresService.fetchUpcomingProcedures({
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get('list/past')
  pastProcedures(@Pagination() pagination: { page: number; limit: number }) {
    return this.proceduresService.fetchPastProcedures({
      page: pagination.page,
      limit: pagination.limit,
    });
  }
}
