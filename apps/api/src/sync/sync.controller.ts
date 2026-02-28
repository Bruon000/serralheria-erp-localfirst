import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { SyncService } from "./sync.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("sync")
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post()
  async sync(@Request() req: any, @Body() body: any) {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    return this.syncService.sync(companyId, userId, body);
  }
}
