require('dotenv').config();
const knex = require('knex');
const ArticlesService = require('./articles-service');

const db = knex({
  client: 'pg',
  connection: process.env.DB_URL
});

ArticlesService.getAllArticles(db)
  .then(res => console.log(res))
  .catch(err => console.log(err.message))
  .finally(() => db.destroy());


