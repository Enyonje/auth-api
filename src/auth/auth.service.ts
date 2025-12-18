import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'crypto'
import * as argon2 from 'argon2'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async sendMagicLink(email: string) {
    let user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await this.prisma.user.create({ data: { email } })
    }

    const token = randomUUID()
    const hash = await argon2.hash(token)

    await this.prisma.magicLink.create({
      data: {
        token: hash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    // send email here (mocked)
    console.log(`Magic link token: ${token}`)

    return { sent: true }
  }

  async verifyMagicLink(token: string) {
    const links = await this.prisma.magicLink.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    const match = await Promise.any(
      links.map(async (link: any) =>
        (await argon2.verify(link.token, token)) ? link : null,
      ),
    ).catch(() => null)

    if (!match) throw new UnauthorizedException()

    await this.prisma.magicLink.update({
      where: { id: match.id },
      data: { used: true },
    })

    const accessToken = this.jwt.sign({ sub: match.user.id })
    const refreshToken = randomUUID()

    await this.prisma.refreshToken.create({
      data: {
        token: await argon2.hash(refreshToken),
        userId: match.user.id,
      },
    })

    return { accessToken, refreshToken }
  }
}
