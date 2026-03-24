import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTripStore } from '../../stores/tripStore';
import { useCollectionStore, type MemberBalance } from '../../stores/collectionStore';
import { db } from '../../db';
import type { Expense, Collection } from '../../types';
import { AmountDisplay } from '../../components/ui/AmountDisplay';
import { fmt } from '../../utils/fmt';
import { User } from 'lucide-react';

export const Personal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeTrip } = useTripStore();
  const { calcBalances } = useCollectionStore();

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [balance, setBalance] = useState<MemberBalance | null>(null);

  useEffect(() => {
    if (activeTrip && activeTrip.members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(activeTrip.members[0].id);
    }
  }, [activeTrip, selectedMemberId]);

  useEffect(() => {
    if (!id || !selectedMemberId) return;

    db.expenses.where({ tripId: id }).toArray().then(all => {
      setExpenses(all.filter(e =>
        e.paidBy === selectedMemberId || e.splits.some(s => s.memberId === selectedMemberId)
      ));
    });

    db.collections.where({ tripId: id, memberId: selectedMemberId }).toArray().then(setCollections);
  }, [id, selectedMemberId]);

  useEffect(() => {
    if (!id || !selectedMemberId || !activeTrip) return;
    calcBalances(id, [selectedMemberId]).then(([b]) => {
      if (b) setBalance(b);
    });
  }, [id, selectedMemberId, activeTrip, calcBalances, expenses, collections]);

  if (!activeTrip || !id) return null;

  const trip = activeTrip;
  const member = trip.members.find(m => m.id === selectedMemberId);

  return (
    <div className="space-y-6">
      {/* 成員選擇器 */}
      <section>
        <label htmlFor="personal-member" className="budgee-label flex items-center gap-2">
          <User size={20} /> 選擇旅伴
        </label>
        <select
          id="personal-member"
          value={selectedMemberId}
          onChange={e => setSelectedMemberId(e.target.value)}
          className="budgee-input cursor-pointer"
        >
          {trip.members.map(m => (
            <option key={m.id} value={m.id}>{m.nickname}</option>
          ))}
        </select>
      </section>

      {member && (
        <>
          {/* 餘額摘要 */}
          {balance && (
            <section className="balance-summary-card">
              <h2 className="section-title">{member.nickname} 的餘額摘要</h2>
              <div className="balance-summary-grid">
                <div className="balance-summary-item">
                  <span className="label">分攤總計</span>
                  <span className="value">{fmt(balance.splitTotal)}</span>
                </div>
                <div className="balance-summary-item">
                  <span className="label">代墊總計</span>
                  <span className="value">{fmt(balance.paidTotal)}</span>
                </div>
                <div className="balance-summary-item">
                  <span className="label">已收總計</span>
                  <span className="value">{fmt(balance.displayCollected)}</span>
                </div>
                <div className="balance-summary-item final">
                  <span className="label">最終</span>
                  <AmountDisplay amount={balance.balance} size="lg" />
                  <span className="hint">
                    {Math.round(balance.balance) > 0 ? '（待繳）' : Math.round(balance.balance) < 0 ? '（待退）' : '（已結清）'}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* 花費分攤明細 */}
          <section>
            <h2 className="section-title">花費分攤明細</h2>
            {expenses.filter(e => e.splits.some(s => s.memberId === selectedMemberId)).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>無分攤紀錄</p>
            ) : (
              <table className="budgee-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>花費</th>
                    <th>品項</th>
                    <th className="text-right">分攤金額</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses
                    .filter(e => e.splits.some(s => s.memberId === selectedMemberId))
                    .map(exp => {
                      const split = exp.splits.find(s => s.memberId === selectedMemberId)!;
                      const option = split.optionId
                        ? exp.options?.find(o => o.id === split.optionId)
                        : null;
                      return (
                        <tr key={exp.id}>
                          <td>{exp.date.slice(5).replace('-', '/')}</td>
                          <td>
                            <div>{exp.title || (exp.category === 'split' ? '分攤型' : '選項型')}</div>
                          </td>
                          <td>{option?.label ?? '—'}</td>
                          <td className="font-semibold text-right">{fmt(split.amount)}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            )}
          </section>

          {/* 代墊紀錄 */}
          <section>
            <h2 className="section-title">代墊紀錄</h2>
            {expenses.filter(e => e.paidBy === selectedMemberId).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>無代墊紀錄</p>
            ) : (
              <table className="budgee-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>花費</th>
                    <th className="text-right">代墊金額</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses
                    .filter(e => e.paidBy === selectedMemberId)
                    .map(exp => (
                      <tr key={exp.id}>
                        <td>{exp.date.slice(5).replace('-', '/')}</td>
                        <td>
                          {exp.title || (exp.category === 'split' ? '分攤型' : '選項型')}
                        </td>
                        <td className="font-semibold text-right">{fmt(exp.totalAmount)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </section>

          {/* 收款紀錄 */}
          <section>
            <h2 className="section-title">付款紀錄</h2>
            {collections.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>無收款紀錄</p>
            ) : (
              <table className="budgee-table">
                <thead>
                  <tr>
                    <th className="text-right">金額</th>
                    <th>備註</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map(c => (
                    <tr key={c.id}>
                      <td className="font-semibold text-right" style={{ color: c.type === 'payout' ? 'var(--color-success)' : undefined }}>
                        {fmt(c.amount)}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      {trip.members.length === 0 && (
        <div className="empty-state">
          <User size={48} strokeWidth={1.5} />
          <p>尚未新增任何旅伴</p>
        </div>
      )}
    </div>
  );
};
