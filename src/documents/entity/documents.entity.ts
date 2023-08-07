import { Users } from "src/auth/entity/usuarios.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";

@Entity({name: 'documents'})
export class Documents extends BaseEntity{

    @PrimaryColumn({ name: 'resume', type: 'character varying', nullable: false, unique: true})
    resume: string;

    @Column({ name: 'createDate', type: 'date', nullable: false })
    createDate: Date;

    @ManyToOne( () => Users, users => users.codigo)
    @JoinColumn({name: 'creator'})
    users: Users;

    @Column({ name: 'name', type: 'character varying', nullable: false })
    name: string;

    @Column({ name: 'path', type: 'character varying', nullable: false })
    path: string;

    @Column({ name: 'estatus', type: 'character varying', nullable: false })
    estatus: string;

    @Column({ name: 'signature', type: 'character varying', nullable: true })
    signature: string;

    @Column({ name: 'endResume', type: 'character varying', nullable: true })
    endResume: string;

    @Column({ name: 'signDate', type: 'date', nullable: true })
    signDate: Date;
}