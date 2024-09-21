import { Controller, Get } from '@nestjs/common';
import { ProceduresService } from './procedures.service';

@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}
  @Get()
  findAll() {
    return this.proceduresService.findAll();
  }

  @Get('list/upcoming')
  upcomingProcedures() {
    return this.proceduresService.fetchUpcomingProcedures();
  }
}
