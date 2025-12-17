import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  sendMagicLink(@Body('email') email: string) {
    return this.authService.sendMagicLink(email);
  }

  @Post('magic-link/verify')
  verifyMagicLink(@Body('token') token: string) {
    return this.authService.verifyMagicLink(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
