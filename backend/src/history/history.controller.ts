import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateHistoryEntryDto } from "./dto/create-history-entry.dto";
import { HistoryService } from "./history.service";

@Controller("history")
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  findAll(@Query("year") year?: string) {
    return this.historyService.findAll(year ? Number(year) : undefined);
  }

  @Post()
  create(@Body() dto: CreateHistoryEntryDto) {
    return this.historyService.create(dto);
  }
}
