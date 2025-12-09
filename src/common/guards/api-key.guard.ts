import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from '../../api-keys/api-keys.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeys: ApiKeyService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();

    const apiKey = req.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException('API key missing');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const key = await this.apiKeys.validate(apiKey);

    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    req.apiKey = key; // ✅ now fully typed
    return true;
  }
}
