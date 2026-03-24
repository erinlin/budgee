import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTripStore } from '../../stores/tripStore';
import { useQuickStartStore } from '../../stores/quickStartStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { UserPlus, Trash2, Users, ChevronDown } from 'lucide-react';

export const Members: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeTrip, addMember, deleteMember, checkMemberHasExpenses } = useTripStore();
  const { memberNicknames, addMemberNickname } = useQuickStartStore();

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [showQuickPick, setShowQuickPick] = useState(false);
  const quickPickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showQuickPick) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (quickPickRef.current && !quickPickRef.current.contains(e.target as Node)) {
        setShowQuickPick(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuickPick]);

  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);

  if (!activeTrip || !id) return null;
  const isArchived = activeTrip.archived;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nickname.trim();
    if (!name) {
      setError('暱稱為必填');
      return;
    }

    if (activeTrip.members.some(m => m.nickname === name)) {
      if (!window.confirm('已有相同暱稱的旅伴，是否繼續新增？')) {
        return;
      }
    }

    setError('');
    await addMember(id, name);
    addMemberNickname(name);
    setNickname('');
  };

  const handleQuickAdd = (name: string) => {
    setNickname(name);
    setShowQuickPick(false);
  };

  const handleDeleteClick = async (memberId: string, memberName: string) => {
    if (isArchived) return;
    const hasExpenses = await checkMemberHasExpenses(id, memberId);
    setMemberToDelete({ id: memberId, name: memberName });
    setDeleteWarning(hasExpenses);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (memberToDelete && id) {
      await deleteMember(id, memberToDelete.id);
    }
    setConfirmOpen(false);
    setMemberToDelete(null);
  };

  return (
    <div className="space-y-8">
      {!isArchived && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="text-xl font-bold" style={{ margin: 0 }}>新增旅伴</h2>
            {memberNicknames.length > 0 && (
              <div ref={quickPickRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="budgee-input cursor-pointer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'auto', minHeight: 36, padding: '0 12px', fontSize: '0.9em' }}
                  onClick={() => setShowQuickPick(v => !v)}
                >
                  <span style={{ color: 'var(--text-muted)' }}>常用旅伴</span>
                  <ChevronDown size={16} style={{ flexShrink: 0, transform: showQuickPick ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              {showQuickPick && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  width: 280,
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  padding: 8,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 4,
                  maxHeight: 260,
                  overflowY: 'auto',
                }}>
                  {[...memberNicknames].reverse().map(name => (
                    <button
                      key={name}
                      type="button"
                      className="quick-chip"
                      onClick={() => handleQuickAdd(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>

          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <Label htmlFor="nickname">旅伴暱稱</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="例如：小明"
                error={!!error}
              />
              {error && <p className="text-red-500 mt-2 text-base font-medium">{error}</p>}
            </div>
            <Button type="submit" variant="primary" className="w-full h-[52px]">
              <UserPlus size={20} /> 新增
            </Button>
          </form>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          旅伴列表
          <span
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '0.8em',
              fontWeight: 600,
              padding: '2px 12px',
            }}
          >
            {activeTrip.members.length} 人
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {activeTrip.members.map(member => (
            <div key={member.id} className="member-card-row">
              <span className="font-semibold flex-1 min-w-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {member.nickname}
              </span>
              {!isArchived && (
                <button
                  className="member-delete"
                  onClick={() => handleDeleteClick(member.id, member.nickname)}
                  aria-label={`刪除 ${member.nickname}`}
                >
                  <Trash2 size={22} />
                </button>
              )}
            </div>
          ))}

          {activeTrip.members.length === 0 && (
            <div className="member-empty-state">
              <Users size={40} strokeWidth={1.5} />
              <span>尚未新增任何旅伴</span>
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        isOpen={confirmOpen}
        title={`刪除旅伴：${memberToDelete?.name}`}
        description={
          deleteWarning
            ? '警告：該旅伴已有相關的分攤或代墊紀錄，刪除後將影響現有花費結算！確定要繼續嗎？'
            : '確定要刪除這位旅伴嗎？'
        }
        confirmText="確定刪除"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
