import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTripStore } from '../../stores/tripStore';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Edit, Archive, Trash2, Tag, ChevronRight, Lock } from 'lucide-react';

export const TripSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, setArchived, deleteTrip } = useTripStore();

  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (!activeTrip || !id) return null;
  const isArchived = activeTrip.archived;

  const handleArchive = async () => {
    await setArchived(id, true);
    setArchiveConfirmOpen(false);
  };

  const handleDelete = async () => {
    await deleteTrip(id);
    navigate('/');
  };

  return (
    <div className="space-y-8">
      {/* 旅行資訊 */}
      <section>
        <h2 className="text-xl font-bold mb-4">旅行資訊</h2>
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
            <div>
              <div className="font-bold text-xl" style={{ marginBottom: 4 }}>{activeTrip.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95em' }}>
                {activeTrip.startDate} ～ {activeTrip.endDate}
              </div>
              {activeTrip.description && (
                <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.95em' }}>
                  {activeTrip.description}
                </div>
              )}
              {isArchived && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, background: '#fef3c7', color: '#92400e', borderRadius: 20, padding: '4px 12px', fontSize: '0.85em', fontWeight: 600 }}>
                  <Lock size={13} /> 已封存・唯讀模式
                </div>
              )}
            </div>
            {!isArchived && (
              <Button variant="secondary" onClick={() => navigate(`/trip/${id}/edit`)} style={{ flexShrink: 0 }}>
                <Edit size={18} /> 編輯
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 花費類型入口 */}
      <section>
        <h2 className="text-xl font-bold mb-4">花費類型</h2>
        <Link
          to={`/trip/${id}/expense-types`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md) var(--spacing-lg)', textDecoration: 'none', color: 'var(--text-main)', transition: 'box-shadow 0.15s' }}
          onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)')}
          onMouseOut={(e) => (e.currentTarget.style.boxShadow = '')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <Tag size={22} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div className="font-semibold" style={{ fontSize: 'var(--font-size-lg)' }}>管理花費類型</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
                {activeTrip.expenseTypes.length} 個類型（{activeTrip.expenseTypes.filter(t => !t.builtIn).length} 個自訂）
              </div>
            </div>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
        </Link>
      </section>

      {/* 危險操作 */}
      {!isArchived && (
        <section>
          <h2 className="text-xl font-bold mb-4">操作</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <Button variant="secondary" className="w-full" onClick={() => setArchiveConfirmOpen(true)}>
              <Archive size={20} /> 封存旅行
            </Button>
            <Button variant="danger" className="w-full" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 size={20} /> 刪除旅行
            </Button>
          </div>
        </section>
      )}

      <ConfirmDialog
        isOpen={archiveConfirmOpen}
        title="封存旅行"
        description="封存後旅行將進入唯讀模式，所有編輯功能將停用。確定要封存嗎？"
        confirmText="確定封存"
        onConfirm={handleArchive}
        onCancel={() => setArchiveConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="刪除旅行"
        description={`確定要刪除「${activeTrip.title}」嗎？此操作無法復原，旅行內所有花費與收款紀錄也將一併刪除。`}
        confirmText="確定刪除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};
