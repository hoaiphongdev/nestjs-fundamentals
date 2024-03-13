// module.exports = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: '123456',
//   database: 'postgres',
//   entities: [__dirname + '/entities/**/*.{js,ts}'],
//   migrations: [__dirname + '/dist/src/migrations/*.js'],
//   cli: {
//     migrationsDir: 'src/migrations',
//   },
// };

// // new syntax for TypeORM ormconfig.ts

const { DataSource } = require('typeorm');

const connectionSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'postgres',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  migrationsRun: false,
  cli: {
    migrationsDir: './migrations',
  },
});

module.exports = {
  connectionSource,
};
