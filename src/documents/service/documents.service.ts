import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Documents } from "../entity/documents.entity";
import { Repository } from "typeorm";

@Injectable()
export class DocumentsService{
    constructor(
        @InjectRepository(Documents) private documentsRepository: Repository<Documents>
    ){}

    findAll(){
        return this.documentsRepository.find();
    }

    async createDocument(objeto: any){
        const newDocument = this.documentsRepository.create(objeto);
        await this.documentsRepository.save(newDocument)
        return {
            msg: `Archivo cargado correctamente, resumen del documento: ${objeto.resume}`
        }
    }
}