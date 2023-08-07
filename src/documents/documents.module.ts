import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Documents } from "./entity/documents.entity";
import { DocumentsService } from "./service/documents.service";
import { DocumentsController } from "./controller/documents.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Documents])
    ],
    controllers: [DocumentsController],
    providers: [DocumentsService]
})

export class DocumentsModule {}