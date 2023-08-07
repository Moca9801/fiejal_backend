import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Signers } from "../entity/signers.entity";
import { Repository } from "typeorm";

@Injectable()
export class SignersService{
    constructor(
        @InjectRepository(Signers) private signersRepository: Repository<Signers>
    ){}

    findAll(){
        return this.signersRepository.find()
    }

    async createSigner(objeto){
        const signer = await this.signersRepository.findOne({ 
            where: { 
                documents: { 
                    resume: objeto.documents.resume  
                },
                users: {
                    codigo: objeto.users.codigo
                }
            }
        });

        console.log(signer)

        if(signer) throw new HttpException('USER_IS_ALREDY_A_SIGNATORY_FOR_THIS_DOCUMENT', 404);

        const newSigner = this.signersRepository.create(objeto);
        return await this.signersRepository.save(newSigner)
    }
}