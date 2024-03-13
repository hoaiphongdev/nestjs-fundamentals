import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get()
  async findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return await this.coffeesService.findAll(paginationQueryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.coffeesService.findOne(id);
  }

  @Post()
  async create(@Body() body: CreateCoffeeDto) {
    return await this.coffeesService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCoffeeDto: UpdateCoffeeDto,
  ) {
    return await this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.coffeesService.remove(id);
  }
}
