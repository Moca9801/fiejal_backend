import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { SignersService } from "../service/signers.service";
import { Signer } from "aws-sdk";

@Controller('signers')
export class SignersController{
    constructor(
        private signersService: SignersService,
    ){}

    @Get('/filter')
    x(){
        return this.signersService.findAll();
    }

    @Post('/create/')
    createSigner(@Body() signers: any[]){
        const signersCreated = []

        for(const objeto of signers){
        const signer = {
            users: {
                "codigo": objeto.codempleado
            },
            documents: {
                resume: objeto.resumeDocument
            },
            signDate: null,
            estatus: "En proceso de firma"
        };
        try{
            const newSigner = this.signersService.createSigner(signer);
            signersCreated.push(newSigner)
        }catch{
            return ('este usuario ya es firmante')
        }
    }
    return signersCreated;
    }
}