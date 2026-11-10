var KeepsPlanMath = (() => {
  function cents(value) {
    const text = String(value).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
    const [whole, fraction = ''] = text.split('.');
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return Number.isSafeInteger(result) && result > 0 && result <= 100000000 ? result : null;
  }
  function balances(people, expenses) {
    const totals = Object.fromEntries(people.map(person => [person, 0]));
    for (const expense of expenses) {
      if (!people.length || !Object.hasOwn(totals, expense.payer)) continue;
      totals[expense.payer] += expense.cents;
      const share = Math.floor(expense.cents / people.length), extra = expense.cents % people.length;
      people.forEach((person, index) => { totals[person] -= share + (index < extra ? 1 : 0); });
    }
    return totals;
  }
  return { cents, balances };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = KeepsPlanMath;
