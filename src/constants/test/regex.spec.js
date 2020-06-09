import { expect } from 'chai';

import { chance } from '../../../test/chance';

import { URL, YOUTUBE } from '../regex';

describe('Constants(Regex)', () => {
  describe('func(URL)', () => {
    it('should create a regex for a given domain', () => {
      const domain = `${chance.word()}.com`;

      expect(Boolean(URL(domain).exec(domain))).equals(true);
    });

    it('should support matching domains that include www', () => {
      const domain = `${chance.word()}.com`;

      expect(Boolean(URL(domain).exec(`www.${domain}`))).equals(true);
    });

    it('should support matching domains that include https', () => {
      const domain = `${chance.word()}.com`;

      expect(Boolean(URL(domain).exec(`https://${domain}`))).equals(true);
    });

    it('should support matching domains that include http', () => {
      const domain = `${chance.word()}.com`;

      expect(Boolean(URL(domain).exec(`http://${domain}`))).equals(true);
    });

    it('should support matching domains that include https and www', () => {
      const domain = `${chance.word()}.com`;

      expect(Boolean(URL(domain).exec(`https://www.${domain}`))).equals(true);
    });

    it('should support matching domains that include http and www', () => {
      const domain = `${chance.word()}.com`;

      expect(Boolean(URL(domain).exec(`http://www.${domain}`))).equals(true);
    });

    it('should support matching domains with paths', () => {
      const domain = `${chance.word()}.com`;

      expect(Boolean(URL(domain).exec(`http://www.${domain}/some-extra-path?v=something`))).equals(true);
    });
  });

  describe('const(YOUTUBE)', () => {
    it('should detect youtube urls', () => {
      expect(Boolean(YOUTUBE.exec('youtube.com'))).equals(true);
    });
  });
});
