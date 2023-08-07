import { Documents } from "src/documents/entity/documents.entity";
import { Signatures } from "src/signatures/entity/signatures.entity";
import { Signers } from "src/signers/entity/signers.entity";
import { BaseEntity, Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity({name: 'users'})
export class Users extends BaseEntity{

    @OneToOne(() => Signatures )
    signatures: Signatures;

    @Column({ name: 'nombre', type: 'character varying', nullable: false})
    nombre: string;

    @PrimaryColumn({ name: 'codigo', type: 'numeric', unique: true, nullable: false})
    codigo: number;

    @Column({ name: 'email', type: 'character varying', nullable: false, unique: true})
    email: string;

    @Column({ name: 'password', type: 'character varying', nullable: false})
    password: string;

    @Column({ name: 'cargo', type: 'character varying', nullable: false})
    cargo: string;

    @Column({ name: 'dependencia', type: 'character varying', nullable: false})
    dependencia: string;
}