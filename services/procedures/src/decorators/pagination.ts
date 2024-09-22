import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { page = 1, limit = 10 } = request.query;

    // Ensure valid pagination values
    const validPage = Math.max(1, parseInt(page));
    const validLimit = Math.min(Math.max(1, parseInt(limit)), 100); // Max limit of 100

    return { page: validPage, limit: validLimit };
  },
);
