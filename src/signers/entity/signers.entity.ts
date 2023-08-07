import { Users } from "src/auth/entity/usuarios.entity";
import { Documents } from "src/documents/entity/documents.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity({name: 'signers'})
export class Signers extends BaseEntity{

    @PrimaryColumn({name: 'id', type: 'integer', nullable: false})
    id: number

    @OneToOne( () => Users, users => users.codigo)
    @JoinColumn({name: 'codempleado'})
    users: Users

    @OneToOne( () => Documents, documents => documents.resume)
    @JoinColumn({name: 'resumeDocument'})
    documents: Documents[];

    @Column({name: 'signDate', type: 'date', nullable: true})
    signDate: Date;

    @Column({name: 'estatus', type:'character varying', nullable: false})
    estatus: string;
}