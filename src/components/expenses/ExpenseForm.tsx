import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Trip, ExpenseOption, Split } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { calcSplitAmounts, calcPerItemAmounts } from '../../stores/expenseStore';
import { fmt } from '../../utils/fmt';
import { X, CheckSquare, Square, Plus, Trash2 } from 'lucide-react';

interface InlineOption {
  id: string;
  label: string;
  price: string;
}

export interface ExpenseFormData {
  category: 'split' | 'per-item';
  title: string;
  date: string;
  totalAmount: number;
  paidBy: string | null;
  options?: ExpenseOption[];
  splits: Split[];
}

interface ExpenseFormProps {
  trip: Trip;
  initialData?: ExpenseFormData & { id?: string };
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onClose: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ trip, initialData, onSubmit, onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  const clampDate = (d: string) => {
    if (!trip.startDate || !trip.endDate) return d;
    if (d < trip.startDate) return trip.startDate;
    if (d > trip.endDate) return trip.endDate;
    return d;
  };

  const [category, setCategory] = useState<'split' | 'per-item'>(initialData?.category ?? 'split');
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [date, setDate] = useState(initialData?.date ?? clampDate(today));
  const [paidBy, setPaidBy] = useState<string | null>(initialData?.paidBy ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 分攤型狀態
  const [splitTotal, setSplitTotal] = useState(
    initialData?.category === 'split' ? (initialData.totalAmount?.toString() ?? '') : ''
  );
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialData?.category === 'split' ? (initialData.splits?.map(s => s.memberId) ?? []) : []
  );

  // 選項型狀態
  const [options, setOptions] = useState<InlineOption[]>(() => {
    if (initialData?.category === 'per-item' && initialData.options?.length) {
      return initialData.options.map(o => ({ id: o.id, label: o.label, price: o.price.toString() }));
    }
    return [{ id: uuidv4(), label: '', price: '' }];
  });
  const [memberOptions, setMemberOptions] = useState<Record<string, string>>(() => {
    if (initialData?.category === 'per-item' && initialData.splits) {
      return Object.fromEntries(
        initialData.splits.filter(s => s.optionId).map(s => [s.memberId, s.optionId!])
      );
    }
    return {};
  });

  // 切換模式時重設相關狀態
  const handleCategoryChange = (cat: 'split' | 'per-item') => {
    setCategory(cat);
    setError('');
    if (cat === 'per-item') {
      setOptions([{ id: uuidv4(), label: '', price: '' }]);
      setMemberOptions({});
    } else {
      setSelectedMembers([]);
      setSplitTotal('');
    }
  };

  // 預設分類快速帶入（只取 per-item 類型）
  const perItemPresets = trip.expenseTypes.filter(t => t.category === 'per-item' && t.options?.length);

  const applyPreset = (presetId: string) => {
    const preset = trip.expenseTypes.find(t => t.id === presetId);
    if (!preset?.options) return;
    setOptions(preset.options.map(o => ({ id: o.id, label: o.label, price: o.price.toString() })));
    setMemberOptions({});
    if (!title) setTitle(preset.name);
  };

  // 選項管理
  const addOption = () => setOptions(prev => [...prev, { id: uuidv4(), label: '', price: '' }]);
  const removeOption = (optId: string) => {
    setOptions(prev => prev.filter(o => o.id !== optId));
    setMemberOptions(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (next[k] === optId) next[k] = ''; });
      return next;
    });
  };
  const updateOption = (optId: string, field: 'label' | 'price', value: string) => {
    setOptions(prev => prev.map(o => o.id === optId ? { ...o, [field]: value } : o));
  };

  // 成員選取（分攤型）
  const toggleMember = (memberId: string) =>
    setSelectedMembers(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);

  const toggleAllMembers = () =>
    setSelectedMembers(prev => prev.length === trip.members.length ? [] : trip.members.map(m => m.id));

  // 選項型合計預覽
  const perItemTotal = options.reduce((sum, o) => {
    const participating = Object.values(memberOptions).filter(v => v === o.id).length;
    return sum + (parseFloat(o.price) || 0) * participating;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!date) { setError('請選擇日期'); return; }

    let splits: Split[] = [];
    let totalAmount = 0;
    let finalOptions: ExpenseOption[] | undefined;

    if (category === 'split') {
      const amount = parseFloat(splitTotal);
      if (isNaN(amount) || amount <= 0) { setError('請輸入有效的總金額'); return; }
      if (selectedMembers.length === 0) { setError('請至少選擇一位分攤成員'); return; }
      totalAmount = amount;
      splits = calcSplitAmounts(amount, selectedMembers);
    } else {
      const validOpts = options.filter(o => o.label.trim() && o.price !== '');
      if (validOpts.length === 0) { setError('請至少新增一個選項（填入名稱與價格）'); return; }

      const parsedOpts: ExpenseOption[] = validOpts.map(o => ({
        id: o.id,
        label: o.label.trim(),
        price: parseFloat(o.price) || 0,
      }));
      finalOptions = parsedOpts;

      const assignedMembers = Object.entries(memberOptions).filter(([, optId]) => optId);
      if (assignedMembers.length === 0) { setError('請至少為一位成員選擇品項'); return; }

      const map: Record<string, { optionId: string; price: number }> = {};
      for (const [memberId, optionId] of assignedMembers) {
        const opt = parsedOpts.find(o => o.id === optionId);
        if (opt) map[memberId] = { optionId, price: opt.price };
      }
      const result = calcPerItemAmounts(map);
      splits = result.splits;
      totalAmount = result.totalAmount;
    }

    if (totalAmount <= 0) { setError('總金額必須大於 0'); return; }

    try {
      setSubmitting(true);
      await onSubmit({ category, title, date, totalAmount, paidBy, options: finalOptions, splits });
    } catch {
      setError('儲存失敗，請重試');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="新增花費">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{initialData?.id ? '編輯花費' : '新增花費'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-5">
          {/* 模式切換 */}
          <div className="category-toggle">
            <button
              type="button"
              className={`category-toggle-btn${category === 'split' ? ' active' : ''}`}
              onClick={() => handleCategoryChange('split')}
            >
              分攤型
            </button>
            <button
              type="button"
              className={`category-toggle-btn${category === 'per-item' ? ' active' : ''}`}
              onClick={() => handleCategoryChange('per-item')}
            >
              選項型
            </button>
          </div>

          {/* 標題 */}
          <div>
            <Label htmlFor="expense-title">標題</Label>
            <Input
              id="expense-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={category === 'split' ? '例如：第一晚住宿' : '例如：午餐'}
            />
          </div>

          {/* 日期 */}
          <div>
            <Label htmlFor="expense-date">日期</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              min={trip.startDate}
              max={trip.endDate}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* ── 分攤型 ── */}
          {category === 'split' && (
            <>
              <div>
                <Label htmlFor="split-total">總金額</Label>
                <Input
                  id="split-total"
                  type="number"
                  min="0"
                  step="0.01"
                  value={splitTotal}
                  onChange={e => setSplitTotal(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>分攤成員</Label>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm"
                    style={{ color: 'var(--color-primary)', border: '1.5px solid var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '4px 10px', background: 'transparent' }}
                    onClick={toggleAllMembers}
                  >
                    {selectedMembers.length === trip.members.length
                      ? <><CheckSquare size={18} /> 取消全選</>
                      : <><Square size={18} /> 全選</>
                    }
                  </button>
                </div>
                <div className="member-checkbox-grid">
                  {trip.members.map(m => {
                    const checked = selectedMembers.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`member-checkbox-item${checked ? ' selected' : ''}`}
                        onClick={() => toggleMember(m.id)}
                        aria-pressed={checked}
                      >
                        <span className="member-checkbox-icon">
                          {checked ? <CheckSquare size={20} /> : <Square size={20} />}
                        </span>
                        {m.nickname}
                      </button>
                    );
                  })}
                </div>
                {selectedMembers.length > 0 && parseFloat(splitTotal) > 0 && (
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                    {(() => {
                      const total = parseFloat(splitTotal);
                      const n = selectedMembers.length;
                      const each = Math.ceil(total / n);
                      const surplus = each * n - total;
                      return surplus > 0
                        ? `每人 ${fmt(each)}（多收 ${fmt(surplus)}）`
                        : `每人 ${fmt(each)}`;
                    })()}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── 選項型 ── */}
          {category === 'per-item' && (
            <>
              {/* 快速預設 */}
              {perItemPresets.length > 0 && (
                <div>
                  <Label>快速套用預設</Label>
                  <div className="preset-chips">
                    {perItemPresets.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        className="quick-chip"
                        onClick={() => applyPreset(t.id)}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 選項列表 */}
              <div>
                <Label>選項</Label>
                <div className="options-list">
                  <div className="options-header">
                    <span>選項名稱</span>
                    <span>價格</span>
                    <span />
                  </div>
                  {options.map(opt => (
                    <div key={opt.id} className="option-row">
                      <Input
                        value={opt.label}
                        onChange={e => updateOption(opt.id, 'label', e.target.value)}
                        placeholder="例如：A 套餐"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={opt.price}
                        onChange={e => updateOption(opt.id, 'price', e.target.value)}
                        placeholder="0"
                      />
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => removeOption(opt.id)}
                        aria-label="刪除選項"
                        disabled={options.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="add-option-btn"
                  onClick={addOption}
                >
                  <Plus size={18} /> 新增選項
                </button>
              </div>

              {/* 每人選擇 */}
              {trip.members.length > 0 && (
                <div>
                  <Label>每人選擇</Label>
                  <div className="per-member-options">
                    {trip.members.map(m => (
                      <div key={m.id} className="per-member-row">
                        <span className="per-member-name">{m.nickname}</span>
                        <select
                          value={memberOptions[m.id] ?? ''}
                          onChange={e => setMemberOptions(prev => ({ ...prev, [m.id]: e.target.value }))}
                          className="budgee-input cursor-pointer per-member-select"
                        >
                          <option value="">不參加</option>
                          {options.filter(o => o.label.trim()).map(opt => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}{opt.price ? `（${opt.price}）` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  {perItemTotal > 0 && (
                    <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                      合計：{fmt(perItemTotal)}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* 代墊人 */}
          <div>
            <Label htmlFor="paid-by">代墊人</Label>
            <select
              id="paid-by"
              value={paidBy ?? ''}
              onChange={e => setPaidBy(e.target.value || null)}
              className="budgee-input cursor-pointer"
            >
              <option value="">無代墊</option>
              {trip.members.map(m => (
                <option key={m.id} value={m.id}>{m.nickname}</option>
              ))}
            </select>
          </div>

          {error && (
            <p role="alert" className="text-base font-medium" style={{ color: 'var(--color-danger)' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>
              取消
            </Button>
            <Button type="submit" variant="primary" fullWidth disabled={submitting}>
              {submitting ? '儲存中...' : initialData?.id ? '更新' : '新增'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
