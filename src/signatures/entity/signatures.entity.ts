import { Users } from "src/auth/entity/usuarios.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

@Entity({name: 'signatures'})
export class Signatures extends BaseEntity{

    @PrimaryColumn({name: 'id', type: 'integer', nullable: false, unique: true })
    id: number;

    @OneToOne(()=> Users, users => users.codigo)
    @JoinColumn({ name: 'codempleado'})
    users:  Users;

    @Column({ name: 'pathCer', type: 'character varying', nullable: true})
    pathCer: string;

    @Column({ name: 'pathKey', type: 'character varying', nullable: true})
    pathKey: string;

    @Column({ name: 'uploadDate', type: 'date', nullable: false})
    uploadDate: Date;

}