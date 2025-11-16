import { Table, Model, Column, DataType, PrimaryKey, Index } from 'sequelize-typescript';

@Table({
  timestamps: false,
  tableName: 'search_console_data',
})

class SearchConsoleData extends Model {
   @PrimaryKey
   @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
   ID!: number;

   @Index
   @Column({ type: DataType.STRING, allowNull: false })
   domain!: string;

   @Index
   @Column({ type: DataType.DATEONLY, allowNull: false })
   date!: string;

   @Column({ type: DataType.STRING, allowNull: false })
   keyword!: string;

   @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'desktop' })
   device!: string;

   @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'ZZ' })
   country!: string;

   @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
   clicks!: number;

   @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
   impressions!: number;

   @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
   ctr!: number;

   @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
   position!: number;

   @Column({ type: DataType.STRING, allowNull: true, defaultValue: '' })
   page!: string;

   @Column({ type: DataType.STRING, allowNull: false })
   uid!: string;
}

export default SearchConsoleData;
