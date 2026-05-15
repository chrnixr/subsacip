import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { CreateSubsacipDto } from "./dto/create-subsacip.dto";
import { UpdateSubsacipDto } from "./dto/update-subsacip.dto";
import { SubsacipService } from "./subsacip.service";

@Controller("subscriptions")
export class SubsacipController {
  constructor(private readonly subsacipService: SubsacipService) {}

  @Get()
  findAll() {
    return this.subsacipService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.subsacipService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSubsacipDto) {
    return this.subsacipService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSubsacipDto) {
    return this.subsacipService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id") id: string) {
    return this.subsacipService.remove(id);
  }
}
