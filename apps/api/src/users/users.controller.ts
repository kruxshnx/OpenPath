import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { type ExperienceLevel } from '@openpath/db';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { toUserDto } from '../common/user.dto';

interface UpdateProfileBody {
  experienceLevel?: ExperienceLevel;
  interests?: string[];
  skills?: string[]; // canonical skill names
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const found = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { skills: { include: { skill: true } } },
    });
    if (!found) {
      throw new NotFoundException('User not found');
    }
    return toUserDto(found);
  }

  @Put('me')
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProfileBody,
  ) {
    await this.prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(body.experienceLevel
          ? { experienceLevel: body.experienceLevel }
          : {}),
        ...(body.interests ? { interests: body.interests } : {}),
      },
    });

    // Replace the user's skill set (only skills present in the taxonomy).
    if (body.skills) {
      const skills = await this.prisma.skill.findMany({
        where: { name: { in: body.skills } },
        select: { id: true },
      });
      await this.prisma.userSkill.deleteMany({ where: { userId: user.userId } });
      if (skills.length) {
        await this.prisma.userSkill.createMany({
          data: skills.map((s) => ({
            userId: user.userId,
            skillId: s.id,
            source: 'SELF_REPORTED' as const,
          })),
          skipDuplicates: true,
        });
      }
    }

    const updated = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { skills: { include: { skill: true } } },
    });
    return toUserDto(updated!);
  }
}
