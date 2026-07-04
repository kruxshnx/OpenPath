import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Called by the web app (NextAuth) with the GitHub access token after the
  // OAuth dance. Returns an app JWT used for all subsequent API calls.
  @Post('github')
  @HttpCode(200)
  async github(@Body() body: { accessToken?: string }) {
    if (!body?.accessToken) {
      throw new BadRequestException('accessToken is required');
    }
    return this.auth.loginWithGithub(body.accessToken);
  }
}
