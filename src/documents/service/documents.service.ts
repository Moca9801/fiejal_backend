import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Documents } from "../entity/documents.entity";
import { Repository } from "typeorm";
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { createPrivateKey, createVerify, createSign, X509Certificate} from 'crypto';
const pdfDoc = require('pdfkit');
const QRCode = require('qrcode');
const PDFMerger = require('mergepdfpages');



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
        return objeto.resume;
    }

    async signDocument(body: any){
        var resume = body.resume
        const document = await this.documentsRepository.findOne({
            where: {
                resume: resume //resumen del documento original
            }
        })
        if(!document) throw new HttpException('DOCUMENT_NOT_FOUND', 404);

        const folderCERPath =  '/s3_data/temp/cer';
        const folderKEYPath =  '/s3_data/temp/key';
        const patternCER = /.*\.cer$/;
        const patternKEY = /.*\.key$/;

        fs.readdir(path.join(process.cwd() + folderCERPath), (err, files) => {
            if(files.length === 0) throw new HttpException('CERFILE_NOT_FOUND', 404);
            files.forEach(CERFile => {
                if(patternCER.test(CERFile)){
                    const cerPath = join(process.cwd() + folderCERPath, CERFile);

                    fs.readdir(path.join(process.cwd() + folderKEYPath), (err, files) =>{
                        if(files.length === 0) throw new HttpException('KEYFILE_NOT_FOUND', 404)
                        files.forEach(KEYFile => {
                            if(patternKEY.test(KEYFile)){
                                const keyPath = path.join(process.cwd() + folderKEYPath, KEYFile);

                                const KEYFILE = fs.readFileSync(keyPath);
                                try{
                                    //Leer llave privada y desencriptarla con la contraseña
                                    const decryptPrivKey = createPrivateKey({key: KEYFILE , type: 'pkcs8', format: 'der', passphrase: body.password }); //Firma electrónica (llave privada desencriptada)
                                    const decryptPrivKeyinPEM = decryptPrivKey.export({ format: 'pem', type: 'pkcs8' }).valueOf(); 

                                    try{
                                        //FIRMAR
                                        const sign = createSign('SHA256');
                                        sign.update(resume); 
                                        sign.end(); 
                                        const signature = sign.sign(decryptPrivKey, 'base64'); //Aquí está la huella de la firma

                                        try{
                                            //VERIFICACION DE LA FIRMA CON LA LLAVE PUBLICA
                                            const CERFILE = fs.readFileSync(cerPath)
                                            const x509 = new X509Certificate(CERFILE);
                                            const verify = createVerify('SHA256');
                                            verify.update(resume);
                                            verify.end();
                                            const isVerified = verify.verify(x509.publicKey, signature, 'base64');

                                            let estatus = undefined;
                                            if(isVerified === true ){  
                                                estatus = 'Valida';
                                                const subjectData = x509.subject
                                                .split('\n')
                                                .map((attribute) => attribute.split('='))
                                                .reduce((acc, [key, value]) => {
                                                  return { ...acc, [key]: value };
                                                }, {});

                                                const isusserData = x509.issuer
                                                .split('\n')
                                                .map((attribute) => attribute.split('='))
                                                .reduce((acc, [key, value]) => {
                                                  return { ...acc, [key]: value };
                                                }, {});
                                                const now = new Date();
                                                const formattedDate = `${now.getUTCDate()}/${now.getUTCMonth() + 1}/${now.getUTCFullYear()}, ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} UTC`;

                                                QRCode.toDataURL(signature, function(err, url){
                                                    if(err)console.log('fail' + err);
                                                    const doc = new pdfDoc({
                                                        bufferPages: true
                                                    });
                                        
                                                    doc.image('resources/logo-cjj.png', 50, 30, {width: 170});
                                                    doc.moveTo(50,140).lineTo(50, 580).lineTo(550, 580).lineTo(550, 140).fill('#F3F3F3');
                                        
                                                    doc.fillColor('gray').font('Helvetica').text('Documento emitido con Constancia de Conservación de acuerdo a la NOM-151', 320,55, {align: 'left'})
                                                    doc.fillColor('black').font('Helvetica-Bold').text('Firmante:', 60,160)
                                                    doc.fillColor('black').font('Helvetica').text(subjectData['CN'], 60,175)
                                                    doc.fillColor('black').font('Helvetica-Bold').text('Número de serie:', 320,160)
                                                    doc.fillColor('black').font('Helvetica').text(x509.serialNumber, 320,175, { link: 'https://cjj.gob.mx/'})
                                        
                                                    doc.fillColor('black').font('Helvetica-Bold').text('RFC:', 60,210)
                                                    doc.fillColor('black').font('Helvetica').text(subjectData['serialNumber'], 60,225)
                                                    doc.fillColor('black').font('Helvetica-Bold').text('Vigencia:', 320,210)
                                                    doc.fillColor('black').font('Helvetica').text('Bien', 320,225)
                                        
                                                    doc.fillColor('black').font('Helvetica-Bold').text('Identificador único del documento original:', 60,310)
                                                    doc.fillColor('black').font('Helvetica').text(resume, 60,325)
                                        
                                                    doc.fillColor('black').font('Helvetica-Bold').text('Fecha y hora de firmado:', 60,260)
                                                    doc.fillColor('black').font('Helvetica').text(formattedDate, 60,275)
                                                    doc.fillColor('black').font('Helvetica-Bold').text('Algoritmo de firma:', 320,260)
                                                    doc.fillColor('black').font('Helvetica').text('SHA256', 320,275)
                                        
                                                    doc.fillColor('black').font('Helvetica-Bold').fontSize(13).text('Cadena de la firma:', 60, 360);
                                                    doc.image(url, { fit: [160, 160]}).font('Helvetica').text(signature, 230, 375);
                                        
                                                    doc.fillColor('black').font('Helvetica', 9).text('El presente documento fue firmado conforme a lo dispuesto en la Ley de Firma Electrónica Avanzada y el Código de Comercio; utilizando certificados emitidos por un Prestador de Servicios de Certificación (PSC) Seguridata con acreditación otorgada por la Secretaría de Economía. La Ley le confiere la misma validez jurídica que unafirma autógrafa, así como presunción de integridad y presunción de atribución de firmas. Puedes validar este documento a través del validador de firmas en:', 60,650, {align: 'justify'});
                                                    doc.fillColor('#595959').font('Helvetica', 9).text('https://efirma.com/validador-de-firmas', {link : 'https://efirma.com/validador-de-firmas',continued: true})
                                        
                                                    doc.pipe(fs.createWriteStream(join(process.cwd()+'/s3_data/temp/firma', 'zfirma.pdf')))
                                                    doc.end();
                                                });

                                                
                                                const merger = new PDFMerger();
                                                merger.add(fs.readFileSync(join(process.cwd()+ '/'+ document.path )));
                                                merger.add(fs.readFileSync(join(process.cwd()+'/s3_data/temp/firma/zfirma.pdf')));
                                                merger.save(join(process.cwd()+'/'+ document.path));
                                            
                                                let PDFls = fs.readdirSync(join(process.cwd()+'/s3_data/temp/firma'));
                                                let CERls = fs.readdirSync(join(process.cwd()+'/s3_data/temp/cer'));
                                                let KEYls = fs.readdirSync(join(process.cwd()+'/s3_data/temp/key'));
                                            
                                                for(let i=0; i<PDFls.length; i++){
                                                  const PDFfile = join(process.cwd()+'/s3_data/temp/firma/', PDFls[i]);
                                                  fs.unlinkSync(PDFfile);
                                                }
                                            
                                                for(let i=0; i<CERls.length; i++){
                                                  const CERfile = join(process.cwd()+'/s3_data/temp/cer', CERls[i]);
                                                  fs.unlinkSync(CERfile);
                                                }
                                            
                                                for(let i=0; i<KEYls.length; i++){
                                                  const KEYfile = join(process.cwd()+'/s3_data/temp/key', KEYls[i]);
                                                  fs.unlinkSync(KEYfile);
                                                }
                                            
                                                const docBlanc = new pdfDoc();
                                                docBlanc
                                                .text('base', 100, 100)
                                                .pipe(fs.createWriteStream(join(process.cwd()+'/s3_data/temp/firma', 'zfirma.pdf')));
                                                docBlanc.end();
                                                return {msg: `DOCUMENTO FIRMADO CON EXITO`} 
                                                
                                            }
                                            else{ estatus = 'Invalida'}
                                            
                                        }catch(error){
                                            console.log('El certificado que esta utilizando para descifrar la firma no es el correcto.');
                                        }
                                    }catch{
                                        console.log('Ha ocurrido un error al momento de firmar');
                                    }
                                }catch{
                                    console.log('Ha ocurrido un error al descifrar la llave privada');
                                } 
                            }
                        })
                    })
                }
            })
        })
    }

    testDocument(){
        const firmante = 'Angel Israel Moreno Castellanos';
        const now = new Date();
        const formattedDate = `${now.getUTCDate()}/${now.getUTCMonth() + 1}/${now.getUTCFullYear()}, ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} UTC`;
        console.log(formattedDate);
        const RFC = "MOCA980126DK7"
        const vigencia = "Bien"
        const algoritmoFirma = "SHA256"
        const serialNumber = 12345678910
        const resume = '09fb8f83d6c05a74ebf32d5308ec3875437574fc3ac95bc5e6cb618a4bbcd187';
        const signature = 'KukpOi/C/bgmdKA2Z93MqZ8bFcupIM6tduZJ8y+AVpf2xF5aypfcWEx74F2Ixz+K31SdlR4bWoNXHSR7INjqfFwIfcSpr5QkbLVRRlrc+Qxb2qCrtv6txmpCr0SD1Jogdc8O9LZn05biIzzv5bqs9xspJdgnKibwVqOi1xH8EHEzgTZU3LXn07muqZIJErNnyfGPfHxR9inXbklgPXBivqetx315uJhpEKUH2Bcmg6IAch0dEaIaw7uh+G0CRiPPb/+QkXRCi7KPGvP1rdATNLnjq5aav6UC/LN1bq927xS3GwU4FkYtvvP6sR15auj8mGPsaZElP5tdgSC25hTpuA='


        QRCode.toDataURL(signature, function(err, url){
            if(err)console.log('fail' + err);
            const doc = new pdfDoc({
                bufferPages: true
            });

            doc.image('resources/logo-cjj.png', 50, 30, {width: 170});
            doc.moveTo(50,140).lineTo(50, 580).lineTo(550, 580).lineTo(550, 140).fill('#F3F3F3');

            doc.fillColor('gray').font('Helvetica').text('Documento emitido con Constancia de Conservación de acuerdo a la NOM-151', 320,55, {align: 'left'})
            doc.fillColor('black').font('Helvetica-Bold').text('Firmante:', 60,160)
            doc.fillColor('black').font('Helvetica').text(firmante, 60,175)
            doc.fillColor('black').font('Helvetica-Bold').text('Número de serie:', 320,160)
            doc.fillColor('black').font('Helvetica').text(serialNumber, 320,175, { link: 'https://cjj.gob.mx/'})

            doc.fillColor('black').font('Helvetica-Bold').text('RFC:', 60,210)
            doc.fillColor('black').font('Helvetica').text(RFC, 60,225)
            doc.fillColor('black').font('Helvetica-Bold').text('Vigencia:', 320,210)
            doc.fillColor('black').font('Helvetica').text(vigencia, 320,225)

            doc.fillColor('black').font('Helvetica-Bold').text('Identificador único del documento original:', 60,310)
            doc.fillColor('black').font('Helvetica').text(resume, 60,325)

            doc.fillColor('black').font('Helvetica-Bold').text('Fecha y hora de firmado:', 60,260)
            doc.fillColor('black').font('Helvetica').text(formattedDate, 60,275)
            doc.fillColor('black').font('Helvetica-Bold').text('Algoritmo de firma:', 320,260)
            doc.fillColor('black').font('Helvetica').text(algoritmoFirma, 320,275)

            doc.fillColor('black').font('Helvetica-Bold').fontSize(13).text('Cadena de la firma:', 60, 360);
            doc.image(url, { fit: [160, 160]}).font('Helvetica').text(signature, 230, 375);

            doc.fillColor('black').font('Helvetica', 9).text('El presente documento fue firmado conforme a lo dispuesto en la Ley de Firma Electrónica Avanzada y el Código de Comercio; utilizando certificados emitidos por un Prestador de Servicios de Certificación (PSC) Seguridata con acreditación otorgada por la Secretaría de Economía. La Ley le confiere la misma validez jurídica que unafirma autógrafa, así como presunción de integridad y presunción de atribución de firmas. Puedes validar este documento a través del validador de firmas en:', 60,650, {align: 'justify'});
            doc.fillColor('#595959').font('Helvetica', 9).text('https://efirma.com/validador-de-firmas', {link : 'https://efirma.com/validador-de-firmas',continued: true})

            doc.pipe(fs.createWriteStream(join(process.cwd()+'/s3_data/temp/firma', 'zfirma.pdf')))
            doc.end();
          });
    }
}