import { Controller, Get, Param, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { SignaturesService } from "../service/signatures.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import multer, { Multer, diskStorage } from 'multer';
import { existsSync, mkdirSync } from "fs";

@Controller('signatures')
export class SignaturesController{
    constructor(
        private signaturesService: SignaturesService, 
    ){}

    @Get('/filter')
    getAll(){
        return this.signaturesService.findAll();
    }

    @Get('/filter/:codempleado')
    getOne(@Param('codempleado') codempleado: number){
        return this.signaturesService.findOne(codempleado)
    }

    
    @UseInterceptors(FilesInterceptor('files', 2,{
        storage: diskStorage({
            destination: function(req, file, cb){
                const x = req.params.codempleado; // Obtener el código de empleado desde los parámetros de la URL
                const destination = `./s3_data/signatures/${x}/`;
                if (!existsSync(destination)) {
                    mkdirSync(destination, { recursive: true });
                }
                cb(null, destination);
            },
            filename: function(req, file, cb){
                cb(null, file.originalname);
            }
        })
    }))
    @Post('uploadSignature/:codempleado')
    async uploadFiles(
      @UploadedFiles() files: Array<Express.Multer.File>,
      @Param('codempleado') codempleado: number
    ){
        let objeto = {
            pathCer: files[0].path,
            pathKey: files[1].path,
            users: {codigo:codempleado},
            uploadDate: new Date()
        }
        console.log(objeto.users.codigo)
        await this.signaturesService.uploadSignature(objeto)
        console.log(files)
        return{
          msg: `Archivo ${files[0].filename} cargado correctamente ${files}`,
          msg2: `Archivo ${files[1].filename} cargado correctamente ${files}`
         }
    }   
}