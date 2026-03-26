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

    const fundPrepaid = fundPreCollects.reduce((sum, exp) => {
      const split = exp.splits.find(s => s.memberId === memberId);
      return sum + (split?.amount ?? 0);
    }, 0);

    const fundExpenseShare = fundExpenses.reduce((sum, exp) => {
      const split = exp.splits.find(s => s.memberId === memberId);
      return sum + (split?.amount ?? 0);
    }, 0);

    // 餘額 = 一般分攤 + 預收公費 - 代墊 - 已收（公費支出不影響餘額，從公費池出）
    const balance = splitTotal + fundPrepaid - paidTotal - collectedTotal;
    // 公費餘額 = 公費支出 - 預收公費（負=可退，正=需補繳）
    const fundBalance = fundExpenseShare - fundPrepaid;
    // 已收顯示 = 代墊實際覆蓋的自身份額 + 實際收款（純顯示用）
    // 若代墊金額足夠，顯示完整自身義務（分攤 + 公費）；不足則顯示實際涵蓋金額
    const selfCovered = Math.min(paidTotal, selfPaidTotal + fundPrepaid);
    const displayCollected = selfCovered + collectOnlyTotal;

    return {
      memberId,
      splitTotal,
      paidTotal,
      collectedTotal,
      displayCollected,
      balance,
      fundPrepaid,
      fundExpenseShare,
      fundBalance,
    };
  });
}
