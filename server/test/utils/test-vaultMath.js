import test from "ava";
import { calculateCollateralizationRatio } from "../../src/utils/vaultMath.js";

test("calculateCollateralizationRatio returns correct values", async (t) => {
  const scenarios = [
    {
      locked: 1540000000,
      debt: 2138233363,
      expected: 543, // 543%
    },
    {
      locked: 4420000000,
      debt: 14140976045,
      expected: 235, // 235%
    },
  ];
  const quote = {
    quoteAmountIn: 1000000,
    quoteAmountOut: 7548495,
  };
  scenarios.forEach((s) => {
    t.is(
      calculateCollateralizationRatio(Object.assign({}, s, quote)),
      s.expected
    );
  });
});

test("calculateCollateralizationRatio returns correct basisPoint values", async (t) => {
  const scenarios = [
    {
      locked: 1540000000,
      debt: 2138233363,
      bps: true,
      expected: 54365, // 543.65%
    },
    {
      locked: 4420000000,
      debt: 14140976045,
      bps: true,
      expected: 23594, // 235.94%
    },
  ];
  const quote = {
    quoteAmountIn: 1000000,
    quoteAmountOut: 7548495,
  };
  scenarios.forEach((s) => {
    t.is(
      calculateCollateralizationRatio(Object.assign({}, s, quote)),
      s.expected
    );
  });
});
