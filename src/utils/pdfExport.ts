import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Trip, Expense, Collection } from '../types';
import { fmt } from './fmt';
import { db } from '../db';

function getMemberName(trip: Trip, memberId: string | null): string {
  if (!memberId) return '無代墊';
  return trip.members.find(m => m.id === memberId)?.nickname ?? '未知';
}

function calcBalances(
  trip: Trip,
  expenses: Expense[],
  collections: Collection[]
): Array<{ name: string; splitTotal: number; paidTotal: number; collectedTotal: number; balance: number }> {
  return trip.members.map(member => {
    const splitTotal = expenses.reduce((sum, exp) => {
      const split = exp.splits.find(s => s.memberId === member.id);
      return sum + (split?.amount ?? 0);
    }, 0);

    const paidTotal = expenses.reduce((sum, exp) => {
      return exp.paidBy === member.id ? sum + exp.totalAmount : sum;
    }, 0);

    const collectedTotal = collections
      .filter(c => c.memberId === member.id)
      .reduce((sum, c) => sum + c.amount, 0);

    const balance = splitTotal - paidTotal - collectedTotal;

    return { name: member.nickname, splitTotal, paidTotal, collectedTotal, balance };
  });
}

export async function exportTripAsPdf(tripId: string): Promise<void> {
  const trip = await db.trips.get(tripId);
  if (!trip) throw new Error('找不到旅行資料');

  const expenses = await db.expenses.where({ tripId }).sortBy('date');
  const collections = await db.collections.where({ tripId }).toArray();

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // jsPDF 預設不支援 CJK，使用 UTF-8 模式盡量渲染
  // 若需完整 CJK 支援，需嵌入 NotoSansCJK 字型

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // ===== 標題區 =====
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(trip.title, margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${trip.startDate} - ${trip.endDate}`, margin, 28);
  doc.text(`成員: ${trip.members.length} 人`, margin, 35);
  if (trip.description) {
    doc.text(trip.description, margin, 42);
  }
  doc.setTextColor(0, 0, 0);

  // ===== 花費明細表格 =====
  let yStart = trip.description ? 52 : 48;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('花費明細', margin, yStart);
  yStart += 6;

  const expenseRows = expenses.map(exp => {
    const categoryLabel = exp.category === 'split' ? '分攤型' : '選項型';
    const paidBy = getMemberName(trip, exp.paidBy);
    const splitMembers = exp.splits.map(s => {
      const m = trip.members.find(m => m.id === s.memberId);
      return m?.nickname ?? '';
    }).filter(Boolean).join(', ');
    return [
      exp.date,
      categoryLabel,
      exp.title || '-',
      fmt(exp.totalAmount),
      paidBy,
      splitMembers || '-',
    ];
  });

  autoTable(doc, {
    startY: yStart,
    head: [['日期', '類型', '標題', '金額', '代墊人', '分攤人']],
    body: expenseRows,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  // ===== 每人收款摘要 =====
  const finalY = (doc as any).lastAutoTable?.finalY ?? 100;
  let summaryY = finalY + 12;

  if (summaryY > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    summaryY = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('每人收款摘要', margin, summaryY);
  summaryY += 6;

  const balances = calcBalances(trip, expenses, collections);
  const summaryRows = balances.map(b => [
    b.name,
    fmt(b.splitTotal),
    fmt(b.paidTotal),
    fmt(b.collectedTotal),
    `${fmt(Math.abs(b.balance))} ${b.balance > 0 ? '(待繳)' : b.balance < 0 ? '(待退)' : '(結清)'}`,
  ]);

  autoTable(doc, {
    startY: summaryY,
    head: [['成員', '分攤總計', '代墊總計', '已收總計', '餘額']],
    body: summaryRows,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  // ===== 頁碼 =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Budgee | ${trip.title} | ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // 下載
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`budgee-${trip.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')}-${dateStr}.pdf`);
}
