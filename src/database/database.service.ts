import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';

export const databaseProviders = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    async useFactory(configService: ConfigService) {
      const connectionOptions: any = {
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<string>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USERNAME'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        synchronize: false,
        retryDelay: 3000,
        retryAttempts: 10, 
        entities:['dist/**/*.entity{.ts,.js}',],
        autoLoadEntities: true,
      };
      
      return connectionOptions as ConnectionOptions;
    },
  }),
];