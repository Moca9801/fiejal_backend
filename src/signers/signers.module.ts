import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Signers } from "./entity/signers.entity";
import { SignersController } from "./controller/signers.controller";
import { SignersService } from "./service/signers.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Signers])
    ],
    controllers: [SignersController],
    providers: [SignersService]
})

export class signersModule {}