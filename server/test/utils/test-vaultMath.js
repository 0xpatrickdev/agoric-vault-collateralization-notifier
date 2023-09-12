import test from "ava";
import { calculateCollateralizationRatio } from "../../src/utils/vaultMath.js";

const fixtures = {
  scenarios: [
    {
      locked: 1540000000,
      debt: 2138233363,
      expected: 543, // 543%
      expectedBps: 54365, // 543.65%
    },
    {
      locked: 4420000000,
      debt: 14140976045,
      expected: 235, // 235%
      expectedBps: 23594, // 235.94%
    },
  ],
  quote: {
    quoteAmountIn: 1000000,
    quoteAmountOut: 7548495,
    amountInDecimals: 6,
    amountOutDecimals: 6,
  },
};

test("calculateCollateralizationRatio returns correct values", async (t) => {
  fixtures.scenarios.forEach((s) => {
    t.is(
      calculateCollateralizationRatio(Object.assign({}, s, fixtures.quote)),
      s.expected
    );
  });
});

test("calculateCollateralizationRatio returns correct basisPoint values", async (t) => {
  const bpsScenarios = fixtures.scenarios.map((s) => ({
    ...s,
    bps: true,
  }));
  bpsScenarios.forEach((s) => {
    t.is(
      calculateCollateralizationRatio(Object.assign({}, s, fixtures.quote)),
      s.expectedBps
    );
  });
});

test("calculateCollateralizationRatio throws with invalid inputs", async (t) => {
  const baseScenario = Object.assign({}, fixtures.scenarios[0], fixtures.quote);
  const keys = Object.keys(baseScenario);

  let invalidScenarios = [];
  for (const key of keys) {
    const invalidScenario = Object.assign({}, baseScenario, { [key]: 0 });
    if (key === "expected" || key === "expectedBps") {
      invalidScenarios.push(undefined);
    } else {
      invalidScenarios.push(invalidScenario);
    }
  }
  invalidScenarios.forEach((s, i) => {
    if (s === undefined) return;
    t.throws(
      () => calculateCollateralizationRatio(s),
      undefined,
      `index ${i} should throw when arg ${keys[i]} is 0`
    );
  });
});

test("calculateCollateralizationRatio works with differing decimal places", async (t) => {
  const scale = 10 ** 2; // 6 decimals --> 8 decimals
  const decimalScenarios = fixtures.scenarios.map((s) => ({
    ...s,
    locked: s.locked * scale,
  }));
  const modifiedQuoteOut = Object.assign({}, fixtures.quote, {
    quoteAmountOut: fixtures.quote.quoteAmountOut * scale,
    amountOutDecimals: 8,
  });
  decimalScenarios.forEach((s) => {
    t.is(
      calculateCollateralizationRatio(Object.assign({}, s, modifiedQuoteOut)),
      s.expected
    );
    t.is(
      calculateCollateralizationRatio(
        Object.assign({ bps: true }, s, modifiedQuoteOut)
      ),
      s.expectedBps
    );
  });

  // test amountInDecimals > amountOutDecimals
  const decimalInScenarios = fixtures.scenarios.map((s) => ({
    ...s,
    debt: s.debt * scale,
  }));
  const modifiedQuoteIn = Object.assign({}, fixtures.quote, {
    quoteAmountIn: fixtures.quote.quoteAmountIn * scale,
    amountInDecimals: 8,
  });
  decimalInScenarios.forEach((s) => {
    t.is(
      calculateCollateralizationRatio(Object.assign({}, s, modifiedQuoteIn)),
      s.expected
    );
    t.is(
      calculateCollateralizationRatio(
        Object.assign({ bps: true }, s, modifiedQuoteIn)
      ),
      s.expectedBps
    );
  });
});
