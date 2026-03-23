import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTripStore } from '../../stores/tripStore';
import { useCollectionStore, type MemberBalance } from '../../stores/collectionStore';
import type { CollectionType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AmountDisplay } from '../../components/ui/AmountDisplay';
import { fmt } from '../../utils/fmt';
import { Plus, Trash2, Wallet } from 'lucide-react';

export const Collections: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeTrip } = useTripStore();
  const { collections, isLoading, loadCollections, addCollection, deleteCollection, calcBalances } = useCollectionStore();

  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form state
  const [collType, setCollType] = useState<CollectionType>('collect');
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadCollections(id);
  }, [id, loadCollections]);

  useEffect(() => {
    if (id && activeTrip) {
      calcBalances(id, activeTrip.members.map(m => m.id)).then(setBalances);
    }
  }, [id, activeTrip, collections, calcBalances]);

  if (!activeTrip || !id) return null;

  const trip = activeTrip;
  const isArchived = trip.archived;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!memberId) { setFormError('請選擇旅伴'); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setFormError('請輸入有效金額'); return; }

    try {
      setSubmitting(true);
      await addCollection({ tripId: id, memberId, amount: amt, type: collType, note });
      setMemberId('');
      setAmount('');
      setNote('');
      setShowForm(false);
    } catch {
      setFormError('儲存失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  const getMemberName = (mId: string) => trip.members.find(m => m.id === mId)?.nickname ?? '未知';

  return (
    <div className="space-y-6">
      {/* 餘額摘要表 */}
      <section>
        <h2 className="section-title">每人餘額</h2>
        {trip.members.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>尚未新增旅伴</p>
        ) : (
          <div className="balance-table-wrap">
            <table className="budgee-table">
              <thead>
                <tr>
                  <th>成員</th>
                  <th className="text-right">分攤</th>
                  <th className="text-right">代墊</th>
                  <th className="text-right">已收</th>
                  <th className="text-right">餘額</th>
                </tr>
              </thead>
              <tbody>
                {balances.map(b => (
                  <tr key={b.memberId}>
                    <td className="font-semibold">{getMemberName(b.memberId)}</td>
                    <td className="text-right">{fmt(b.splitTotal)}</td>
                    <td className="text-right">{fmt(b.paidTotal)}</td>
                    <td className="text-right">{fmt(b.displayCollected)}</td>
                    <td className="text-right">
                      <AmountDisplay amount={b.balance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              正值（紅）= 尚欠繳｜負值（綠）= 待退款
            </p>
          </div>
        )}
      </section>

      {/* 收款紀錄 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">收/退款紀錄</h2>
          {!isArchived && (
            <Button variant="primary" onClick={() => setShowForm(!showForm)}>
              <Plus size={20} />新增
            </Button>
          )}
        </div>

        {/* 新增表單 */}
        {showForm && !isArchived && (
          <form onSubmit={handleSubmit} className="expense-form-inline space-y-3 mb-4">
            <div className="flex gap-3">
              <div style={{ flex: 2 }}>
                <Label htmlFor="coll-member">成員</Label>
                <select
                  id="coll-member"
                  value={memberId}
                  onChange={e => {
                    const selected = e.target.value;
                    setMemberId(selected);
                    if (selected) {
                      const b = balances.find(b => b.memberId === selected);
                      if (b && b.balance > 0) {
                        setAmount(String(Math.round(b.balance)));
                        setCollType('collect');
                        setNote('');
                      } else if (b && b.balance < 0) {
                        setAmount(String(Math.round(Math.abs(b.balance))));
                        setCollType('payout');
                        setNote('退款');
                      } else {
                        setAmount('');
                        setCollType('collect');
                        setNote('');
                      }
                    } else {
                      setAmount('');
                      setCollType('collect');
                      setNote('');
                    }
                  }}
                  className="budgee-input cursor-pointer"
                >
                  <option value="">請選擇旅伴</option>
                  {trip.members.map(m => (
                    <option key={m.id} value={m.id}>{m.nickname}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <Label htmlFor="coll-amount">金額</Label>
                <Input
                  id="coll-amount"
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {memberId && (
              <p className="text-sm font-medium" style={{ color: collType === 'payout' ? 'var(--color-success)' : 'var(--color-primary)' }}>
                類型：{collType === 'payout' ? '退款給代墊人' : '收款（應繳）'}
              </p>
            )}

            <div>
              <Label htmlFor="coll-note">備註</Label>
              <Input
                id="coll-note"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="選填"
              />
            </div>

            {formError && (
              <p role="alert" className="text-base font-medium" style={{ color: 'var(--color-danger)' }}>
                {formError}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={() => setShowForm(false)}>
                取消
              </Button>
              <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                {submitting ? '儲存中...' : '新增'}
              </Button>
            </div>
          </form>
        )}

        {isLoading && <p className="text-center" style={{ color: 'var(--text-muted)' }}>載入中...</p>}

        {!isLoading && collections.length === 0 && (
          <div className="empty-state">
            <Wallet size={48} strokeWidth={1.5} />
            <p>尚無收款紀錄</p>
          </div>
        )}

        {collections.length > 0 && (
          <div className="expense-table-wrap">
            <table className="budgee-table">
              <thead>
                <tr>
                  <th>成員</th>
                  <th className="text-right">金額</th>
                  <th>備註</th>
                  {!isArchived && <th style={{ width: 60 }} />}
                </tr>
              </thead>
              <tbody>
                {collections.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold">{getMemberName(c.memberId)}</td>
                    <td className="text-right">
                      <span style={{ fontWeight: 600, color: c.type === 'payout' ? 'var(--color-warning, #f97316)' : undefined }}>{fmt(c.amount)}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.note || '—'}</td>
                    {!isArchived && (
                      <td>
                        <button
                          className="icon-btn danger"
                          onClick={() => setDeleteTarget(c.id)}
                          aria-label="刪除收款紀錄"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="刪除收款紀錄"
        description="確定要刪除這筆收款紀錄嗎？"
        confirmText="確定刪除"
        onConfirm={async () => {
          if (deleteTarget) await deleteCollection(deleteTarget, id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
