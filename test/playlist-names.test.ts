import { describe, expect, it } from 'vitest';
import { generatePlaylistNames } from '../src/helpers/playlist-names';

describe('generatePlaylistNames', () => {
  describe('input handling', () => {
    it('returns no names for an empty list', () => {
      expect(generatePlaylistNames([])).toEqual(new Map());
    });

    it.each([
      ['the same title', 'Music'],
      ['different titles', 'News']
    ])('rejects duplicate IDs with %s', (_, secondTitle) => {
      expect(() =>
        generatePlaylistNames([
          { id: 'same', title: 'Music' },
          { id: 'same', title: secondTitle }
        ])
      ).toThrow('Duplicate playlist IDs detected.');
    });

    it('preserves unique titles, including titles that resemble generated names', () => {
      const names = generatePlaylistNames([
        { id: 'one', title: 'Music' },
        { id: 'two', title: 'Music • abcd' }
      ]);

      expect(names).toEqual(
        new Map([
          ['one', 'Music'],
          ['two', 'Music • abcd']
        ])
      );
    });
  });

  describe('ID suffixes for repeated titles', () => {
    it('disambiguates repeated titles with the last four ID characters', () => {
      const names = generatePlaylistNames([
        { id: 'prefix-abcdef', title: 'Music' },
        { id: 'prefix-ghijkl', title: 'Music' }
      ]);

      expect(names).toEqual(
        new Map([
          ['prefix-abcdef', 'Music • cdef'],
          ['prefix-ghijkl', 'Music • ijkl']
        ])
      );
    });

    it('uses the full ID when IDs are shorter than four characters', () => {
      const names = generatePlaylistNames([
        { id: 'a', title: 'Music' },
        { id: 'b', title: 'Music' }
      ]);

      expect(names).toEqual(
        new Map([
          ['a', 'Music • a'],
          ['b', 'Music • b']
        ])
      );
    });

    it('extends the suffix when the last four ID characters are identical', () => {
      const names = generatePlaylistNames([
        { id: 'xabcdef', title: 'Music' },
        { id: 'yabcdef', title: 'Music' }
      ]);

      expect(names).toEqual(
        new Map([
          ['xabcdef', 'Music • xabcdef'],
          ['yabcdef', 'Music • yabcdef']
        ])
      );
    });

    it('uses the same suffix length for the whole group when only some IDs collide', () => {
      const names = generatePlaylistNames([
        { id: 'xabcdef', title: 'Music' },
        { id: 'yabcdef', title: 'Music' },
        { id: 'zghijkl', title: 'Music' }
      ]);

      expect(names).toEqual(
        new Map([
          ['xabcdef', 'Music • xabcdef'],
          ['yabcdef', 'Music • yabcdef'],
          ['zghijkl', 'Music • zghijkl']
        ])
      );
    });

    it('distinguishes different-length IDs that share an entire shorter ID', () => {
      const names = generatePlaylistNames([
        { id: 'abcdef', title: 'Music' },
        { id: 'xabcdef', title: 'Music' }
      ]);

      expect(names).toEqual(
        new Map([
          ['abcdef', 'Music • abcdef'],
          ['xabcdef', 'Music • xabcdef']
        ])
      );
    });
  });

  describe('collisions with existing titles', () => {
    it('reserves original titles before generating names for any group', () => {
      const names = generatePlaylistNames([
        { id: 'xabcdef', title: 'Music' },
        { id: 'yghijkl', title: 'Music' },
        { id: 'other', title: 'Music • cdef' }
      ]);

      expect(names).toEqual(
        new Map([
          ['xabcdef', 'Music • bcdef'],
          ['yghijkl', 'Music • hijkl'],
          ['other', 'Music • cdef']
        ])
      );
    });

    it('adds a numeric discriminator when full IDs collide with titles and skips occupied discriminators', () => {
      const names = generatePlaylistNames([
        { id: 'abcd', title: 'Music' },
        { id: 'ghij', title: 'Music' },
        { id: 'reserved-full', title: 'Music • abcd' },
        { id: 'reserved-number', title: 'Music • ghij-1' }
      ]);

      expect(names).toEqual(
        new Map([
          ['abcd', 'Music • abcd-2'],
          ['ghij', 'Music • ghij-2'],
          ['reserved-full', 'Music • abcd'],
          ['reserved-number', 'Music • ghij-1']
        ])
      );
    });
  });
});
