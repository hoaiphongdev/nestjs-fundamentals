import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavor } from './entities/flavors.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly connection: Connection,
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    private readonly configService: ConfigService,
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
  ) {
    const databaseHost = this.configService.get('database.host', 'localhost');
    console.log('> HOST', databaseHost);
    console.log('> Coffee configs', coffeesConfiguration.foo);
    console.log(coffeeBrands);
  }

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto;
    return await this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number) {
    const found = await this.coffeeRepository.findOne({
      where: {
        id,
      },
      relations: ['flavors'],
    });
    if (!found) {
      throw new NotFoundException(`Coffee #${id} could not found`);
    }

    return found;
  }

  async create(createCoffeeto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeto.flavors.map((name) => this.preloadFlavorByName(name)),
    );

    const coffee = this.coffeeRepository.create({
      ...createCoffeeto,
      flavors,
    });

    return this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));

    const found = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    });
    if (!found) {
      throw new NotFoundException(`Coffee #${id} could not found`);
    }
    return await this.coffeeRepository.save(found);
  }

  async remove(id: number) {
    const found = await this.findOne(id);
    return await this.coffeeRepository.remove(found);
  }

  async recomendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recomendations++;

      const recommandEvent = new Event();
      recommandEvent.name = 'recommand_coffee';
      recommandEvent.type = 'coffee';
      recommandEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommandEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const found = await this.flavorRepository.findOne({ where: { name } });
    if (found) return found;
    return this.flavorRepository.create({ name });
  }
}
