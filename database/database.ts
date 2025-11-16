import { Sequelize } from 'sequelize-typescript';
import Domain from './models/domain';
import Keyword from './models/keyword';
import SearchConsoleData from './models/searchConsoleData';
import Settings from './models/settings';

const connection = new Sequelize(process.env.DATABASE_URL || '', {
   dialect: 'postgres',
   dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
         require: true,
         rejectUnauthorized: false
      } : false
   },
   pool: {
      max: 5,
      min: 0,
      idle: 10000,
   },
   logging: false,
   models: [Domain, Keyword, SearchConsoleData, Settings],
});

export default connection;
