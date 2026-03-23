import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTripStore } from '../../stores/tripStore';
import { useQuickStartStore } from '../../stores/quickStartStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Role } from '../../types';
import { UserPlus, Trash2, Users } from 'lucide-react';

export const Members: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeTrip, addMember, deleteMember, checkMemberHasExpenses } = useTripStore();
  const { memberNicknames, addMemberNickname } = useQuickStartStore();

  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [error, setError] = useState('');

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
      if (!window.confirm('已有相同暱稱的成員，是否繼續新增？')) {
        return;
      }
    }

    setError('');
    await addMember(id, name, role);
    addMemberNickname(name);
    setNickname('');
    setRole('member');
  };

  const handleQuickAdd = (name: string) => {
    setNickname(name);
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
          <h2 className="text-xl font-bold mb-4">新增成員</h2>

          {memberNicknames.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">常用成員</p>
              <div className="flex flex-wrap gap-2">
                {memberNicknames.map(name => (
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
            </div>
          )}

          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              <div style={{ flex: '2', minWidth: '160px' }}>
                <Label htmlFor="nickname">成員暱稱</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="例如：小明"
                  error={!!error}
                />
                {error && <p className="text-red-500 mt-2 text-base font-medium">{error}</p>}
              </div>
              <div style={{ flex: '1', minWidth: '120px' }}>
                <Label htmlFor="role">角色</Label>
                <select
                  id="role"
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="budgee-input cursor-pointer"
                >
                  <option value="member">一般成員</option>
                  <option value="organizer">主辦人</option>
                  <option value="accountant">會計</option>
                </select>
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full h-[52px]">
              <UserPlus size={20} /> 新增
            </Button>
          </form>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          成員列表
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeTrip.members.map(member => (
            <div key={member.id} className="member-card-row">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xl" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {member.nickname}
                </div>
                <div className="mt-1">
                  <Badge role={member.role} />
                </div>
              </div>
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
              <span>尚未新增任何成員</span>
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        isOpen={confirmOpen}
        title={`刪除成員：${memberToDelete?.name}`}
        description={
          deleteWarning
            ? '警告：該成員已有相關的分攤或代墊紀錄，刪除後將影響現有花費結算！確定要繼續嗎？'
            : '確定要刪除這位成員嗎？'
        }
        confirmText="確定刪除"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
