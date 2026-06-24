import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly prisma: PrismaService) {}

  // Public: the skill taxonomy, for profile editing and filters.
  @Get()
  list() {
    return this.prisma.skill.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, type: true },
    });
  }
}
