import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useTripStore } from '../../stores/tripStore';
import { useExpenseStore } from '../../stores/expenseStore';
import type { Expense, Trip } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ExpenseForm, type ExpenseFormData } from '../../components/expenses/ExpenseForm';
import { fmt } from '../../utils/fmt';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Receipt } from 'lucide-react';

const formatDate = (d: string) => d.slice(5).replace('-', '/');

function getMemberName(trip: Trip, memberId: string | null): string {
  if (!memberId) return '無代墊';
  return trip.members.find(m => m.id === memberId)?.nickname ?? '未知';
}

function getSplitSummary(trip: Trip, expense: Expense): string {
  if (expense.splits.length === 0) return '—';
  if (expense.splits.length === trip.members.length) return '全員';
  return expense.splits
    .map(s => trip.members.find(m => m.id === s.memberId)?.nickname ?? '')
    .filter(Boolean)
    .join('、');
}

export const Expenses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeTrip } = useTripStore();
  const { expenses, isLoading, loadExpenses, addExpense, updateExpense, deleteExpense } = useExpenseStore();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (id) loadExpenses(id);
  }, [id, loadExpenses]);

  if (!activeTrip || !id) return null;

  const trip = activeTrip;
  const isArchived = trip.archived;

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'date',
      header: '日期',
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      accessorKey: 'title',
      header: '標題',
      cell: ({ getValue }) => getValue<string>() || <span style={{ color: 'var(--text-muted)' }}>—</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: () => <span className="text-right" style={{ display: 'block' }}>金額</span>,
      cell: ({ getValue }) => (
        <span className="text-right" style={{ display: 'block', fontWeight: 600 }}>
          {fmt(getValue<number>())}
        </span>
      ),
    },
    {
      id: 'paidBy',
      header: '代墊人',
      accessorFn: (row) => getMemberName(trip, row.paidBy),
    },
    {
      id: 'splits',
      header: '分攤人',
      enableSorting: false,
      accessorFn: (row) => getSplitSummary(trip, row),
    },
  ];

  const table = useReactTable({
    data: expenses,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSubmit = async (data: ExpenseFormData) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
    } else {
      await addExpense({ ...data, tripId: id });
    }
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteExpense(deleteTarget.id, id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {!isArchived && (
        <Button variant="primary" fullWidth onClick={() => { setEditingExpense(null); setShowForm(true); }}>
          <Plus size={20} /> 新增花費
        </Button>
      )}

      {isLoading && <p className="text-center" style={{ color: 'var(--text-muted)' }}>載入中...</p>}

      {!isLoading && expenses.length === 0 && (
        <div className="empty-state">
          <Receipt size={48} strokeWidth={1.5} />
          <p>尚未新增任何花費</p>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="expense-table-wrap">
          <table className="budgee-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                    >
                      <span className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp size={14} />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown size={14} />}
                      </span>
                    </th>
                  ))}
                  <th style={{ width: 80 }} />
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <React.Fragment key={row.id}>
                  <tr
                    className="expense-row"
                    onClick={() => setExpandedId(expandedId === row.original.id ? null : row.original.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-3 justify-end">
                        {!isArchived && (
                          <>
                            <button
                              className="icon-btn"
                              onClick={() => handleEdit(row.original)}
                              aria-label="編輯"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button
                              className="icon-btn danger"
                              onClick={() => setDeleteTarget(row.original)}
                              aria-label="刪除"
                            >
                              <Trash2 size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* 分攤明細展開列 */}
                  {expandedId === row.original.id && (
                    <tr className="expense-detail-row">
                      <td colSpan={columns.length + 1}>
                        <div className="expense-detail-content">
                          <strong>分攤明細</strong>
                          <table className="detail-table">
                            <thead>
                              <tr>
                                <th>成員</th>
                                {row.original.splits.some(s => s.optionId) && <th>品項</th>}
                                <th className="text-right">金額</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.original.splits.map((split, i) => {
                                const member = trip.members.find(m => m.id === split.memberId);
                                const option = split.optionId
                                  ? row.original.options?.find(o => o.id === split.optionId)
                                  : null;
                                return (
                                  <tr key={i}>
                                    <td>{member?.nickname ?? '未知'}</td>
                                    {row.original.splits.some(s => s.optionId) && (
                                      <td>{option?.label ?? '—'}</td>
                                    )}
                                    <td className="text-right">{fmt(split.amount)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 新增/編輯表單 */}
      {showForm && (
        <ExpenseForm
          trip={trip}
          initialData={editingExpense ? {
            id: editingExpense.id,
            category: editingExpense.category,
            title: editingExpense.title,
            date: editingExpense.date,
            totalAmount: editingExpense.totalAmount,
            paidBy: editingExpense.paidBy,
            options: editingExpense.options,
            splits: editingExpense.splits,
          } : undefined}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingExpense(null); }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="刪除花費"
        description={`確定要刪除「${deleteTarget?.title || (deleteTarget?.category === 'split' ? '分攤型花費' : '選項型花費')}」這筆花費嗎？`}
        confirmText="確定刪除"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
