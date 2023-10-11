import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { SignersService } from "../service/signers.service";
import { Signer } from "aws-sdk";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

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
        /*
        {
            "codempleado": 21110005,
            "resumeDocument": "07b22ebbba4aa762c7bd2b623c625e714c6abdeedb5afb0570c579d7f01b131a"
        }
        */
        for(const objeto of signers){
            const signer = {
                users: {
                    codigo: objeto.codempleado
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