import { initializeNullValues, isValidDate, isValidSSN, isValidName, isNotBlank, isBlank, isValidMonetaryValue } from '../../../../_health-care/_js/utils/validations.js';

describe('Validations unit tests', () => {
  describe('isValidSSN', () => {
    it('accepts ssns of the right one including "invalid" test ones', () => {
      expect(isValidSSN('111-22-1234')).to.be.true;

      // SSNs have certain invalid versions. These are useful for tests so not
      // the validation should return TRUE for them.
      //
      // For information on invalid values see:
      //   https://secure.ssa.gov/poms.nsf/lnx/0110201035
      expect(isValidSSN('666-22-1234')).to.be.true;
      expect(isValidSSN('900-22-1234')).to.be.true;
      expect(isValidSSN('111221234')).to.be.true;
      expect(isValidSSN('111111112')).to.be.true;
    });

    it('rejects invalid ssn format', () => {
      // Disallow empty.
      expect(isValidSSN('')).to.be.false;

      // 123-45-6789 is invalid.
      expect(isValidSSN('123-45-6789')).to.be.false;

      // Invalid characters.
      expect(isValidSSN('111-22-1%34')).to.be.false;
      expect(isValidSSN('111-22-1A34')).to.be.false;
      expect(isValidSSN('hi mom')).to.be.false;

      // No leading or trailing spaces.
      expect(isValidSSN('111-22-1A34 ')).to.be.false;
      expect(isValidSSN(' 111-22-1234')).to.be.false;

      // Too few numbers is invalid.
      expect(isValidSSN('111-22-123')).to.be.false;

      // Consecutive 0's in each segment is invalid.
      expect(isValidSSN('000-22-1234')).to.be.false;
      expect(isValidSSN('111-00-1234')).to.be.false;
      expect(isValidSSN('111-22-0000')).to.be.false;

      // Values with all the same digit are not allowed
      expect(isValidSSN('111111111')).to.be.false;
      expect(isValidSSN('999-99-9999')).to.be.false;
    });
  });

  describe('isValidDate', () => {
    it('validate february separately cause its a special snowflake', () => {
      // 28 should work always.
      expect(isValidDate(28, 2, 2015)).to.be.true;

      // 2015 is not a leap year.
      expect(isValidDate(29, 2, 2015)).to.be.false;

      // 2016 is a leap year.
      expect(isValidDate(29, 2, 2016)).to.be.true;

      // 30 is always bad.
      expect(isValidDate(30, 2, 2016)).to.be.false;

      // 1 is always fine.
      expect(isValidDate(1, 2, 2016)).to.be.true;

      // 0 is always bad.
      expect(isValidDate(0, 2, 2016)).to.be.false;
    });

    it('validate future dates', () => {
      // future dates are bad.
      expect(isValidDate(1, 1, 2050)).to.be.false;
    });
  });

  describe('isValidName', () => {
    it('correctly validates name', () => {
      expect(isValidName('Test')).to.be.true;
      expect(isValidName('abc')).to.be.true;
      expect(isValidName('Jean-Pierre')).to.be.true;
      expect(isValidName('Vigee Le Brun')).to.be.true;

      expect(isValidName('')).to.be.false;
      expect(isValidName('123')).to.be.false;
      expect(isValidName('#$%')).to.be.false;
      expect(isValidName('Test1')).to.be.false;
    });
  });

  describe('isBlank', () => {
    it('correctly validates blank values', () => {
      expect(isBlank('')).to.be.true;

      expect(isBlank('something')).to.be.false;
    });
  });

  describe('isNotBlank', () => {
    it('correctly validates blank values', () => {
      expect(isNotBlank('Test')).to.be.true;
      expect(isNotBlank('abc')).to.be.true;
      expect(isNotBlank('123')).to.be.true;
      expect(isNotBlank('#$%')).to.be.true;

      expect(isNotBlank('')).to.be.false;
    });
  });

  describe('isValidMonetaryValue', () => {
    it('validates monetary values', () => {
      expect(isValidMonetaryValue('100')).to.be.true;
      expect(isValidMonetaryValue('1.99')).to.be.true;
      expect(isValidMonetaryValue('1000')).to.be.true;

      expect(isValidMonetaryValue('')).to.be.false;
      expect(isValidMonetaryValue('1,000')).to.be.false;
      expect(isValidMonetaryValue('abc')).to.be.false;
      expect(isValidMonetaryValue('$100')).to.be.false;
    });
  });

  describe('initializeNullValues', () => {
    it('handles base cases', () => {
      const result = initializeNullValues(
        { a: null,
          b: 1,
          c: '',
          d: 'str',
          e: null,       // Ensure multiple null values are handled.
          f: undefined,  // Ensure undefined is not touched.
          g: true
        });
      expect(result).to.eql(
        { a: '',
          b: 1,
          c: '',
          d: 'str',
          e: '',
          f: undefined,
          g: true
        });
      expect(initializeNullValues(1)).to.eql(1);
      expect(initializeNullValues([])).to.eql([]);
      expect(initializeNullValues({ a: [1] })).to.eql({ a: [1] });
      expect(initializeNullValues(null)).to.eql('');
      expect(initializeNullValues(undefined)).to.be.undefined;
    });

    it('handles nested objects', () => {
      const result = initializeNullValues(
        { a: { foo: '1',
               bar: '',
               baz: null,
               qux: null,
               quux: undefined,
               corge: 3
              },
          b: { foo: null }  // Ensure multiple objects get processed.
        });
      expect(result).to.eql(
        { a: { foo: '1',
               bar: '',
               baz: '',
               qux: '',
               quux: undefined,
               corge: 3
              },
          b: { foo: '' }
        });
    });

    it('handles arrays', () => {
      const result = initializeNullValues(
        { a: [{ foo: '1' },
              { bar: '' },
              { baz: null },
              { qux: null },
              { quux: undefined },
              { corge: 3 }],
          b: [{ foo: null }]  // ensure multiple arrays get processed.
        });
      expect(result).to.eql(
        { a: [{ foo: '1' },
              { bar: '' },
              { baz: '' },
              { qux: '' },
              { quux: undefined },
              { corge: 3 }],
          b: [{ foo: '' }]
        });
    });
  });
});
