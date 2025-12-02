import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token = req.cookies?.access_token;

    if (!token) return false;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.ACCESS_SECRET,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      req.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
