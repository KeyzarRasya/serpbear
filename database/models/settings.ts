import { Table, Model, Column, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
  timestamps: false,
  tableName: 'settings',
})

class Settings extends Model {
   @PrimaryKey
   @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
   ID!: number;

   @Column({ type: DataType.STRING, allowNull: false, unique: true })
   key!: string;

   @Column({ type: DataType.TEXT, allowNull: true })
   value!: string;
}

export default Settings;