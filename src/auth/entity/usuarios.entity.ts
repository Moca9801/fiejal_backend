import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";


@Entity({name: 'users'})
export class Users extends BaseEntity{
    @PrimaryColumn({name: 'id', type: 'integer', nullable: false, unique: true })
    id: number;

    @Column({ name: 'nombre', type: 'character varying', nullable: false})
    nombre: string;

    @Column({ name: 'codigo', type: 'integer', nullable: false})
    codigo: number;

    @Column({ name: 'email', type: 'character varying', nullable: false, unique: true})
    email: string;

    @Column({ name: 'password', type: 'character varying', nullable: false})
    password: string;
}