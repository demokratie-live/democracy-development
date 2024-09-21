import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty, MinLength } from 'class-validator';

@Configuration()
export class DatabaseConfiguration {
  @Value('DB_URL')
  @MinLength(10)
  @IsNotEmpty()
  dbUrl: string;
}
