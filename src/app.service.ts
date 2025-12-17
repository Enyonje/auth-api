import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async verifyMagicLink(token: string) {
    try {
      // existing logic stays here
    } catch (error) {
      console.error('VERIFY MAGIC LINK ERROR:', error);
      throw error;
    }
  }
}