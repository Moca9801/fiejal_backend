import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Signatures } from "../entity/signatures.entity";
import { Repository } from 'typeorm';

@Injectable()
export class SignaturesService{
    constructor(
        @InjectRepository(Signatures) private signaturesRepository: Repository<Signatures>
    ){}

    findAll(){
        return this.signaturesRepository.find();
    }

    findOne(codempleado: number){
        return this.signaturesRepository.findOne( { where: { users:{ codigo: codempleado } } } )
    }

    async uploadSignature(objeto){
       const newSignature = this.signaturesRepository.create(objeto);
        return await this.signaturesRepository.save(newSignature)
    }

    async delete(codempleado: number){
        const user = await this.signaturesRepository.findOne({ where: { users: { codigo: codempleado }}});
    
    }
}