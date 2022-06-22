import assert from 'power-assert';
import nock from 'nock';
import {describe, it} from 'mocha';
import collapsify from '../lib/node.js';

nock.disableNetConnect();

describe('collapsify node', () => {
  it('should collapse an HTML page', async () => {
    nock('https://terinstock.com')
      .get('/')
      .reply(
        200,
        '<!doctype html><html><body><h1>Hi.</h1><img src="avatar.jpeg" /></body></html>',
      )
      .get('/avatar.jpeg')
      .reply(200, '', {
        'Content-Type': 'image/jpeg',
      });

    const collapsed = await collapsify('https://terinstock.com', {});
    assert(typeof collapsed === 'string');
    assert(
      collapsed ===
        '<!doctype html><html><body><h1>Hi.</h1><img src="data:image/jpeg;base64,"/></body></html>',
    );
  });

  it('should reject forbidden resources', async () => {
    try {
      nock('https://terinstock.com')
        .get('/')
        .reply(200, '<!doctype html><img src="http://localhost">');

      await collapsify('https://terinstock.com', {
        forbidden: 'localhost',
      });

      assert(false, 'unexpected Promise resolution');
    } catch (error) {
      assert(error instanceof Error);
      assert(error.message === 'Forbidden resource http://localhost/');
    }
  });
});
