/** Estimate one installation from millimetres, pane counts and integer ZAR cents. */
function calculateEstimate(paneGroups, installedRateCents, extraCents = 0) {
  if (!Array.isArray(paneGroups) || paneGroups.length === 0) {
    throw new RangeError("Enter at least one pane group.");
  }
  if (!Number.isSafeInteger(installedRateCents) || installedRateCents < 1) {
    throw new RangeError("Enter a positive installed rate in whole cents per square metre.");
  }
  if (!Number.isSafeInteger(extraCents) || extraCents < 0) {
    throw new RangeError("Enter extra charges as a non-negative amount in whole cents.");
  }

  let paneCount = 0;
  let areaMm2 = 0;
  for (const group of paneGroups) {
    if (!group || ![group.widthMm, group.heightMm, group.quantity].every(value => Number.isSafeInteger(value) && value > 0)) {
      throw new RangeError("Enter positive whole numbers for each pane’s width, height and quantity.");
    }
    paneCount += group.quantity;
    areaMm2 += group.widthMm * group.heightMm * group.quantity;
  }
  if (!Number.isSafeInteger(areaMm2) || !Number.isSafeInteger(paneCount)) {
    throw new RangeError("These measurements are too large. Check the dimensions and quantities.");
  }

  // One square metre is 1,000,000 mm². Round half up once, after combining all glass.
  const fittingCents = Number((BigInt(areaMm2) * BigInt(installedRateCents) + 500_000n) / 1_000_000n);
  const totalCents = fittingCents + extraCents;
  if (!Number.isSafeInteger(totalCents)) {
    throw new RangeError("This amount is too large. Check the measurements and costs.");
  }
  return { paneCount, areaM2: areaMm2 / 1_000_000, fittingCents, extraCents, totalCents };
}

// The same calculation runs in a plain browser script and in Node.js.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateEstimate };
}
