import type { Trip } from '../types';
import { fmt } from './fmt';
import { db } from '../db';
import { calcBalances } from './balanceCalc';

function getMemberName(trip: Trip, memberId: string | null): string {
  if (!memberId) return '無代墊';
  return trip.members.find(m => m.id === memberId)?.nickname ?? '未知';
}

export async function exportTripAsPdf(tripId: string): Promise<void> {
  const trip = await db.trips.get(tripId);
  if (!trip) throw new Error('找不到旅行資料');

  const expenses = await db.expenses.where({ tripId }).sortBy('date');
  const collections = await db.collections.where({ tripId }).toArray();
  const memberIds = trip.members.map(m => m.id);
  const rawBalances = calcBalances(memberIds, expenses, collections);
  const hasFund = rawBalances.some(b => b.fundPrepaid > 0);
  const balances = rawBalances.map((b, i) => ({
    ...b,
    name: trip.members[i].nickname,
  }));

  const formatDate = (d: string) => d.slice(5).replace('-', '/');

  const expenseRows = expenses.map(exp => {
    const paidBy = exp.category === 'public-fund' ? '公費' : getMemberName(trip, exp.paidBy);
    const splitMembers = exp.splits.map(s =>
      trip.members.find(m => m.id === s.memberId)?.nickname ?? ''
    ).filter(Boolean).join('、');
    return `
      <tr>
        <td>${formatDate(exp.date)}</td>
        <td>${exp.title || '—'}</td>
        <td class="num">${fmt(exp.totalAmount)}</td>
        <td>${paidBy}</td>
        <td>${splitMembers || '—'}</td>
      </tr>`;
  }).join('');

  const balanceRows = balances.map(b => {
    const roundedBalance = Math.round(b.balance);
    const balanceLabel = roundedBalance > 0 ? '待繳' : roundedBalance < 0 ? '待退' : '結清';
    const balanceClass = roundedBalance > 0 ? 'owe' : roundedBalance < 0 ? 'refund' : '';
    const fundSuffix = hasFund && b.fundNet > 0 && roundedBalance > 0 ? `(含公費${fmt(b.fundNet)})` : '';
    return `
      <tr>
        <td>${b.name}</td>
        <td class="num">${fmt(b.splitTotal)}</td>
        ${hasFund ? `<td class="num">${fmt(b.fundPrepaid)}</td>` : ''}
        <td class="num">${fmt(b.paidTotal)}</td>
        <td class="num">${fmt(b.displayCollected)}</td>
        <td class="num ${balanceClass}">${fmt(Math.abs(b.balance))}（${balanceLabel}）${fundSuffix}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>${trip.title} - Budgee</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, 'PingFang TC', 'Noto Sans TC', sans-serif; font-size: 13px; color: #111; padding: 20mm 15mm; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
    h2 { font-size: 15px; margin: 20px 0 8px; border-bottom: 1.5px solid #4d8c0a; padding-bottom: 4px; color: #4d8c0a; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #4d8c0a; color: #fff; padding: 6px 8px; text-align: left; font-size: 12px; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) td { background: #f8f9fa; }
    .num { text-align: right; }
    .owe { color: #dc2626; font-weight: 600; }
    .refund { color: #16a34a; font-weight: 600; }
    footer { margin-top: 24px; text-align: center; color: #aaa; font-size: 11px; }
    @media print {
      body { padding: 10mm 12mm; }
      @page { size: A4; margin: 10mm; }
    }
  </style>
</head>
<body>
  <h1>${trip.title}</h1>
  <div class="meta">${trip.startDate} ～ ${trip.endDate}</div>
  <div class="meta">旅伴：${trip.members.map(m => m.nickname).join('、')}</div>

  <h2>花費明細</h2>
  <table>
    <thead><tr><th>日期</th><th>標題</th><th style="text-align:right">金額</th><th>代墊人</th><th>分攤人</th></tr></thead>
    <tbody>${expenseRows || '<tr><td colspan="5" style="text-align:center;color:#999">尚無花費紀錄</td></tr>'}</tbody>
  </table>

  <h2>每人餘額摘要</h2>
  <table>
    <thead><tr><th>旅伴</th><th style="text-align:right">分攤</th>${hasFund ? '<th style="text-align:right">公費</th>' : ''}<th style="text-align:right">代墊</th><th style="text-align:right">已收</th><th style="text-align:right">餘額</th></tr></thead>
    <tbody>${balanceRows || `<tr><td colspan="${hasFund ? 6 : 5}" style="text-align:center;color:#999">尚無成員</td></tr>`}</tbody>
  </table>

  <footer>Budgee｜${trip.title}｜匯出於 ${new Date().toLocaleDateString('zh-TW')}</footer>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onafterprint = () => URL.revokeObjectURL(url);
  }
}
