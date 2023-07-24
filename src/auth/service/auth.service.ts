import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entity/usuarios.entity';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Users) private authRepository: Repository<Users>
    ){}

    findAll(){
        return this.authRepository.find();
    }

    async register(body: any){
        const { password } = body;
        const plainToHash = await hash(password, 10);

        body = {...body, password:plainToHash}

        const newUser = this.authRepository.create(body);
        return await this.authRepository.save(newUser);
    }

    async login(body: any){
        const { email, password } = body;

        const user = await this.authRepository.findOne({ where:{ email: email }});
        if(!user) throw new HttpException('USER_NOT_FOUND', 404);
        

        const checkPass = await compare(password, user.password)
        if(!checkPass) throw new HttpException('PASSWORD_INCORECT', 403)

        return user;
    }

    async update(email: string, body: any){
      
        const user = await this.authRepository.findOne({ where: { email: email }});
        if(!user) throw new HttpException('USER_NOT_FOUND', 404);

        const { password } = body;
        const plainToHash = await hash(password, 10);
        body = {...body, password:plainToHash};

        this.authRepository.merge(user, body);
        return this.authRepository.save(user);
    }

    async delete(email: string){
        const user = await this.authRepository.findOne({ where: { email: email }});
        if(!user) throw new HttpException('USER_NOT_FOUND', 404);

        await this.authRepository.remove(user);
    }
}
