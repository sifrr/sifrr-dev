const deepMerge = require('../../src/deepmerge');

describe('deepMerge', () => {
  it('is a function', () => {
    expect(typeof deepMerge).to.equal('function');
  });

  it('shallow merges', () => {
    expect(deepMerge({ a: 'b' }, { a: 'haha', c: 'd', e: false, f: null })).to.deep.equal({ a: 'haha', c: 'd', e: false, f: null });
  });

  it('deep merges', () => {
    const newObj = deepMerge({
      a: 'b',
      b: {
        random: 'ok'
      }
    }, {
      a: undefined,
      c: 'd',
      e: false,
      f: null,
      b: {
        random: 'oo',
        next: 'yes'
      }
    });
    expect(newObj).to.deep.equal({
      a: 'b',
      c: 'd',
      e: false,
      f: null,
      b: {
        random: 'oo',
        next: 'yes'
      }
    });
  });

  it('merges arrays', () => {
    expect(deepMerge({ a: ['b'] }, { a: ['ok', 'haha'] })).to.deep.equal({ a: ['b', 'ok', 'haha'] });
  });
});
