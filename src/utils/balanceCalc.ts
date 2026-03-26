import type { Expense, Collection } from '../types';
import type { MemberBalance } from '../stores/collectionStore';

export function calcBalances(
  memberIds: string[],
  expenses: Expense[],
  collections: Collection[]
): MemberBalance[] {
  const normalExpenses = expenses.filter(e => e.category !== 'public-fund');
  const fundPreCollects = expenses.filter(e => e.category === 'public-fund' && e.fundSubType === 'pre-collect');
  const fundExpenses = expenses.filter(e => e.category === 'public-fund' && e.fundSubType === 'expense');

  return memberIds.map(memberId => {
    const splitTotal = normalExpenses.reduce((sum, exp) => {
      const split = exp.splits.find(s => s.memberId === memberId);
      return sum + (split?.amount ?? 0);
    }, 0);

    const paidTotal = normalExpenses.reduce((sum, exp) => {
      return exp.paidBy === memberId ? sum + exp.totalAmount : sum;
    }, 0);

    const selfPaidTotal = normalExpenses.reduce((sum, exp) => {
      if (exp.paidBy !== memberId) return sum;
      const split = exp.splits.find(s => s.memberId === memberId);
      return sum + (split?.amount ?? 0);
    }, 0);

    const collectOnlyTotal = collections
      .filter(c => c.memberId === memberId && c.type !== 'payout')
      .reduce((sum, c) => sum + c.amount, 0);

    const payoutTotal = collections
      .filter(c => c.memberId === memberId && c.type === 'payout')
      .reduce((sum, c) => sum + c.amount, 0);

    const collectedTotal = collectOnlyTotal - payoutTotal;
    const displayCollected = selfPaidTotal + collectOnlyTotal;
    const balance = splitTotal - paidTotal - collectedTotal;

    const fundPrepaid = fundPreCollects.reduce((sum, exp) => {
      const split = exp.splits.find(s => s.memberId === memberId);
      return sum + (split?.amount ?? 0);
    }, 0);

    const fundExpenseShare = fundExpenses.reduce((sum, exp) => {
      const split = exp.splits.find(s => s.memberId === memberId);
      return sum + (split?.amount ?? 0);
    }, 0);

    const fundNet = fundPrepaid - fundExpenseShare;
    const totalBalance = splitTotal + fundNet - paidTotal - collectedTotal;

    return {
      memberId,
      splitTotal,
      paidTotal,
      selfPaidTotal,
      collectedTotal,
      displayCollected,
      balance: totalBalance,
      fundPrepaid,
      fundExpenseShare,
      fundNet,
    };
  });
}
