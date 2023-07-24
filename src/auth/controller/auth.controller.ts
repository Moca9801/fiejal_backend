import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
    constructor( 
        private authService: AuthService,
    ){}

    @Get('/filter')
    getAll(){
        return this.authService.findAll();
    }

    @Post('/register')
    register(@Body() body: any){
        return this.authService.register(body);
    }

    @Post('/login')
    login(@Body() body: any){
        return this.authService.login(body);
    }

    @Put('/update/:email')
    update(@Param('email') email: string, @Body() body: any){
        return this.authService.update(email, body);
    }

    @Delete('/delete/:email')
    delete(@Param('email') email: string){
        return this.authService.delete(email);
    }

}