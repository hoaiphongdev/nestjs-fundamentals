import { Module } from '@nestjs/common';
import { CoffeeRatingService } from './coffee-rating.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    // DatabaseModule.register({
    //   type: 'postgres',
    //   host: 'localhost',
    //   password: 'password',
    //   port: 5432,
    // }),
  ],
  providers: [CoffeeRatingService],
})
export class CoffeeRatingModule {}
