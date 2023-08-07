import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { SignaturesModule } from './signatures/signature.module';
import { DocumentsModule } from './documents/documents.module';
import { signersModule } from './signers/signers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DatabaseModule,
    AuthModule, 
    SignaturesModule,
    DocumentsModule,
    signersModule
  ],
 
})
export class AppModule {}
