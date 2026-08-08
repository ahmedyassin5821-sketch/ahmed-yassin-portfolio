import { resolveLocalized } from './localized';

describe('resolveLocalized', () => {
  it('resolves a leaf to the active language', () => {
    expect(resolveLocalized({ en: 'Work', ar: 'أعمال' }, 'en')).toBe('Work');
    expect(resolveLocalized({ en: 'Work', ar: 'أعمال' }, 'ar')).toBe('أعمال');
  });

  it('walks nested objects', () => {
    const content = {
      hero: { title: { en: 'Ahmed', ar: 'أحمد' }, index: '01' },
    };

    expect(resolveLocalized(content, 'ar')).toEqual({ hero: { title: 'أحمد', index: '01' } });
  });

  it('walks arrays', () => {
    const content = [{ label: { en: 'One', ar: 'واحد' } }, { label: { en: 'Two', ar: 'اثنان' } }];

    expect(resolveLocalized(content, 'ar')).toEqual([{ label: 'واحد' }, { label: 'اثنان' }]);
  });

  it('leaves non-localized values untouched', () => {
    // A shape with extra keys is data, not a translation pair — resolving it
    // would silently discard the other fields.
    const notLocalized = { en: 'a', ar: 'b', other: 'c' };
    expect(resolveLocalized(notLocalized, 'en')).toEqual(notLocalized);

    expect(resolveLocalized(42, 'en')).toBe(42);
    expect(resolveLocalized(null, 'en')).toBeNull();
  });
});
