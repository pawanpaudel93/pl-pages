const helper = require('../helper.js');
const plPages = require('../../lib/index.js');
const path = require('path');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'remove';

beforeEach(() => {
  plPages.clean();
});

describe('the remove option', () => {
  it('removes matched files in remote branch', (done) => {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'pl-pages';
    const remove = '*.{js,css}';

    helper.setupRemote(fixtureName, {branch}).then((url) => {
      const options = {
        repo: url,
        user: {
          name: 'User Name',
          email: 'user@email.com',
        },
        remove: remove,
      };

      plPages.publish(local, options, (err) => {
        if (err) {
          return done(err);
        }
        helper
          .assertContentsMatch(expected, url, branch)
          .then(() => done())
          .catch(done);
      });
    });
  });

  it('skips removing files if there are no files to be removed', (done) => {
    const local = path.join(fixtures, fixtureName, 'remote');
    const branch = 'pl-pages';
    const remove = 'non-exist-file';

    helper.setupRemote(fixtureName, {branch}).then((url) => {
      const options = {
        repo: url,
        user: {
          name: 'User Name',
          email: 'user@email.com',
        },
        remove: remove,
      };

      plPages.publish(local, options, (err) => {
        if (err) {
          return done(err);
        }
        helper
          .assertContentsMatch(local, url, branch)
          .then(() => done())
          .catch(done);
      });
    });
  });
});
