import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripStore } from '../stores/tripStore';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { importTripFromJson, type ImportConflictAction, type ImportResult } from '../utils/exportImport';
import { Plus, Archive, ChevronRight, Calendar, Upload, Settings, Menu, Bird } from 'lucide-react';

export const Home: React.FC = () => {
  const { trips, loadTrips, isLoading } = useTripStore();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [importConflict, setImportConflict] = useState<ImportResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleImportFile = async (file: File, action?: ImportConflictAction) => {
    setImportError('');
    try {
      const result = await importTripFromJson(file, action);
      if (result.conflictExists) {
        setPendingFile(file);
        setImportConflict(result);
        return;
      }
      await loadTrips();
      navigate(`/trip/${result.trip.id}`);
    } catch (e) {
      setImportError('匯入失敗：' + (e as Error).message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImportFile(file);
    e.target.value = '';
  };

  const handleConflictConfirm = async () => {
    setImportConflict(null);
    if (pendingFile) await handleImportFile(pendingFile, 'overwrite');
    setPendingFile(null);
  };

  const handleConflictCancel = async () => {
    setImportConflict(null);
    if (pendingFile) await handleImportFile(pendingFile, 'coexist');
    setPendingFile(null);
  };

  const formatDate = (ts?: number) => {
    if (!ts) return '不明';
    return new Date(ts).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const conflictDescription = importConflict ? (
    <div style={{ fontSize: '0.95em' }}>
      <p style={{ marginBottom: 12 }}>已有相同 ID 的旅行，請比較兩個版本後選擇操作方式：</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
        <thead>
          <tr style={{ background: 'var(--bg-page)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}></th>
            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>本地版本</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>匯入版本</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>最後更新</td>
            <td style={{ padding: '6px 8px' }}>{formatDate(importConflict.localExportedAt)}</td>
            <td style={{ padding: '6px 8px' }}>{formatDate(importConflict.trip.updatedAt)}</td>
          </tr>
          <tr style={{ background: 'var(--bg-page)' }}>
            <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>費用筆數</td>
            <td style={{ padding: '6px 8px' }}>{importConflict.localExpenseCount ?? 0} 筆</td>
            <td style={{ padding: '6px 8px' }}>{importConflict.importExpenseCount ?? 0} 筆</td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85em' }}>
        「覆蓋」將替換本地資料；「建立副本」將以新 ID 並存。
      </p>
    </div>
  ) : '';

  if (isLoading) {
    return <div className="p-4 text-center">載入中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 mb-4 budgee-page">
      <header className="flex items-center justify-between mb-8">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bird size={32} style={{ color: 'var(--color-primary)' }} />
          Budgee
        </h1>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <Button variant="ghost" onClick={() => setMenuOpen((v) => !v)} aria-label="選單" style={{ width: 48, height: 48, padding: 0, background: 'none', border: 'none', color: 'var(--color-primary)' }}>
            <Menu size={28} />
          </Button>
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              minWidth: 180,
              zIndex: 100,
              overflow: 'hidden',
            }}>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-base)', color: 'var(--text-main)', textAlign: 'left' }}
                onClick={() => { setMenuOpen(false); navigate('/trip/new'); }}
              >
                <Plus size={18} /> 新增旅行
              </button>
              <div style={{ height: 1, background: 'var(--border-color)' }} />
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-base)', color: 'var(--text-main)', textAlign: 'left' }}
                onClick={() => { setMenuOpen(false); fileInputRef.current?.click(); }}
              >
                <Upload size={18} /> 匯入旅行
              </button>
              <div style={{ height: 1, background: 'var(--border-color)' }} />
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-base)', color: 'var(--text-main)', textAlign: 'left' }}
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
              >
                <Settings size={18} /> App 設定
              </button>
            </div>
          )}
        </div>
      </header>

      {importError && (
        <p style={{ color: 'var(--color-danger)', fontWeight: 500, marginBottom: 16 }}>{importError}</p>
      )}

      {trips.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-lg text-gray-500 mb-6 font-medium">還沒有任何旅行紀錄，來建立第一個旅行吧！</p>
          <Button onClick={() => navigate('/trip/new')} variant="primary">
            建立新旅行
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="trip-card flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold m-0">{trip.title}</h2>
                  {trip.archived && (
                    <span className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                      <Archive size={14} /> 已封存
                    </span>
                  )}
                </div>
                <div className="text-gray-500 flex items-center gap-2">
                  <Calendar size={18} />
                  {trip.startDate} ~ {trip.endDate} • {trip.members.length} 人參與
                </div>
              </div>
              <ChevronRight size={28} className="text-gray-400" />
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <ConfirmDialog
        isOpen={!!importConflict}
        title="旅行資料衝突"
        description={conflictDescription}
        confirmText="覆蓋現有"
        cancelText="建立副本"
        onConfirm={handleConflictConfirm}
        onCancel={handleConflictCancel}
      />
    </div>
  );
};
