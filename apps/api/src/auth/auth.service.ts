import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { encryptToken } from '../common/crypto.util';
import { toUserDto } from '../common/user.dto';

interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Verifies a GitHub access token by calling the GitHub API directly (we never
   * trust client-supplied identity), upserts the user, and returns an app JWT.
   */
  async loginWithGithub(accessToken: string) {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'OpenPath',
      },
    });
    if (!res.ok) {
      throw new UnauthorizedException('Invalid GitHub access token');
    }
    const gh = (await res.json()) as GithubUser;

    const profile = {
      login: gh.login,
      name: gh.name,
      avatarUrl: gh.avatar_url,
      email: gh.email,
      accessToken: encryptToken(accessToken),
    };

    const user = await this.prisma.user.upsert({
      where: { githubId: BigInt(gh.id) },
      create: { githubId: BigInt(gh.id), ...profile },
      update: profile,
    });

    const token = await this.jwt.signAsync({ sub: user.id, login: user.login });
    return { token, user: toUserDto(user) };
  }
}
