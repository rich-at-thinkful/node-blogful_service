const ArticlesService = require('../src/articles-service');
const { makeArticlesArray } = require('./articles.fixtures');
const knex = require('knex');

describe('ArticlesService', () => {
  let db;
  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });

    return db('blogful_articles').truncate();
  });

  afterEach(() => {
    return db('blogful_articles').truncate();
  });

  after(() => {
    db.destroy();
  });

  const givenSeededData = (runTests) => {
    let testArticles;
    context('Given seeded data', () => {
      testArticles = makeArticlesArray();
      beforeEach(() => {
        return db('blogful_articles')
          .insert(testArticles);
      });

      runTests(testArticles);
    });
  };

  describe('getAllArticles()', () => {
    context('Given no data', () => {
      it('returns empty array', () => {
        return ArticlesService.getAllArticles(db)
          .then(res => {
            expect(res).to.be.an('array');
            expect(res).to.have.lengthOf(0);
          });
      });
    });

    givenSeededData(testArticles => {
      it('returns articles', () => {
        return ArticlesService.getAllArticles(db)
          .then(res => {
            expect(res).to.be.an('array');
            expect(res).to.have.lengthOf(testArticles.length);
          });
      });
    });
  });

  describe('insertArticle()', () => {
    const testArticles = makeArticlesArray();

    it('adds article to db and returns given valid data', () => {
      return ArticlesService.insertArticle(db, testArticles[0])
        .then(res => {
          expect(res).to.be.an('object');
          expect(res).to.include.all.keys(
            'id','title','content','date_published'
          );
          expect(res.title).to.eq(testArticles[0].title);
          expect(res.content).to.eq(testArticles[0].content);
        });     
    });
  });

  describe('getById()', () => {
    givenSeededData(() => {
      it('returns first article', () => {
        return ArticlesService.getById(db, 1)
          .then(res => {
            expect(res).to.be.an('object');
            expect(res).to.include.all.keys(
              'id','content','title','date_published'
            );
          });
      });
    });
  });

  describe('deleteArticle()', () => {
    givenSeededData(testArticles => {
      it('deletes article and returns 1', () => {
        return ArticlesService.deleteArticle(db, 1)
        .then(res => {
          expect(res).to.eq(1);
        });
      });
    });    
  });

  describe('updateArticle()', () => {
    givenSeededData(testArticles => {
      it('will update record and return 1', () => {
        const updateData = {
          title: 'changed title!'
        };

        return ArticlesService.updateArticle(db, 1, updateData)
          .then(res => {
            expect(res).to.eq(1);
            return db('blogful_articles')
              .select('*')
              .where({ id: 1 })
              .first();
          })
          .then(res => {
            expect(res).to.be.an('object');
            expect(res).to.have.property('title');
            expect(res.title).to.eq('changed title!');
          });
      });
    });
  });
});