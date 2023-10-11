import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { DocumentsService } from "../service/documents.service";
import { createHash } from "crypto";
import * as fs from 'fs';
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { existsSync, mkdirSync } from "fs";



@Controller('documents')
export class DocumentsController{
    constructor(
        private documentsService: DocumentsService
    ){}

    @Get('/filter')
    getAll(){
        return this.documentsService.findAll();
    }

    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: function(req, fiule, cb){
              const creator = req.params.creator; // Obtener el código de empleado desde los parámetros de la URL
                  const destination = `./s3_data/documents/${creator}/`;
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
    @Post('/create/:creator')
    createDocument(
        @UploadedFile() file: Express.Multer.File,
        @Param('creator') creator: number,
    ){
        //Función resumen
        const pdfFile = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(pdfFile);
        const resume = hash.digest("hex");
        
        const objeto = {
            resume: resume,
            createDate: new Date(),
            users: {
                codigo: creator
            },
            name: file.originalname,
            path: file.path,
            estatus: "En proceso de firma",
            signature: null,
            endResume: null,
            signDate: null
        }
        return this.documentsService.createDocument(objeto);
    }

      //FUNCION PARA CARGAR EL ARCHIVO .cer 
    @UseInterceptors(FileInterceptor
      ('file', {
        storage: diskStorage({
        destination: './s3_data/temp/cer',
        filename: function(req, file, cb){
          cb(null, file.originalname);
        }})
      })
    )
    @Post('uploadCER')
    uploadCERFile(@UploadedFile() file: Express.Multer.File,){
      console.log(file)
      return{
        msg: `Archivo ${file.filename} cargado correctamente ${file}`
      }
    }

    //FUNCION PARA CARGAR EL ARCHIVO .key 
    @UseInterceptors(FileInterceptor
      ('file', {
        storage: diskStorage({
        destination: './s3_data/temp/key',
        filename: function(req, file, cb){
          cb(null, file.originalname);
        }})
      })
    )
    @Post('uploadKEY')
    uploadKEYFile(@UploadedFile() file: Express.Multer.File,){
      console.log(file)
      return{
        msg: `Archivo ${file.filename} cargado correctamente ${file}`
      }
    }

    @Post('/signDocument/')
    signDocument(@Body() body: any){
        return this.documentsService.signDocument(body);
    }

    @Post('/designDocument')
    testDocument(){
      return this.documentsService.testDocument();
    }
}