import { Body, Controller, Post, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException("Credenciais inválidas");
    return this.authService.login(user);
  }

  @Post("refresh")
  async refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    return { ok: true };
  }
}
