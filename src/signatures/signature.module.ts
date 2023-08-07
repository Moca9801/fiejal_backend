import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Signatures } from "./entity/signatures.entity";
import { SignaturesController } from "./controller/signatures.controller";
import { SignaturesService } from "./service/signatures.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Signatures])
    ],
    controllers: [SignaturesController],
    providers: [SignaturesService]
})

export class SignaturesModule {}