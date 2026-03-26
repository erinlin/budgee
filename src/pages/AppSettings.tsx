import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppSettingsStore } from '../stores/appSettingsStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { ExpenseCategory, ExpenseOption, ExpenseType } from '../types';
import { fmt } from '../utils/fmt';
import { ArrowLeft, Plus, Trash2, Edit2, X } from 'lucide-react';

interface TypeFormData {
  name: string;
  category: ExpenseCategory;
  options: ExpenseOption[];
}

const emptyForm = (): TypeFormData => ({ name: '', category: 'split', options: [] });

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  'split': '平均均攤',
  'per-item': '選項型',
  'general': '通用',
  'public-fund': '公費',
};

export const AppSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, loadSettings, updateDefaultExpenseTypes } = useAppSettingsStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TypeFormData>(emptyForm());
  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (!settings) return <div className="p-4 text-center">載入中...</div>;

  const types = settings.defaultExpenseTypes;
  const builtInTypes = types.filter((t) => t.builtIn);
  const customTypes = types.filter((t) => !t.builtIn);

  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { id: uuidv4(), label: '', price: 0 }],
    }));
  };

  const handleUpdateOption = (optId: string, field: 'label' | 'price', value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === optId ? { ...o, [field]: value } : o)),
    }));
  };

  const handleRemoveOption = (optId: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== optId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('類型名稱為必填');
      return;
    }
    setFormError('');

    const editingType = editingId ? types.find((t) => t.id === editingId) : null;
    const typeData: ExpenseType = {
      id: editingId ?? uuidv4(),
      name: formData.name.trim(),
      category: formData.category,
      defaultAll: editingType?.defaultAll ?? false,
      builtIn: editingType?.builtIn ?? false,
      options: formData.category !== 'split' && formData.options.length > 0
        ? formData.options
        : undefined,
    };

    const updated = editingId
      ? types.map((t) => (t.id === editingId ? typeData : t))
      : [...types, typeData];

    await updateDefaultExpenseTypes(updated);
    cancelForm();
  };

  const handleEditClick = (typeId: string) => {
    const type = types.find((t) => t.id === typeId);
    if (!type) return;
    setFormData({ name: type.name, category: type.category, options: type.options ?? [] });
    setEditingId(typeId);
    setShowAddForm(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    await updateDefaultExpenseTypes(types.filter((t) => t.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData(emptyForm());
    setFormError('');
  };

  const TypeForm = () => (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--color-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div>
          <Label htmlFor="type-name">類型名稱</Label>
          <Input
            id="type-name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="例如：交通費"
            error={!!formError}
            autoComplete="off"
          />
          {formError && <p className="text-red-500 mt-2 text-base font-medium">{formError}</p>}
        </div>

        <div>
          <Label htmlFor="type-category">計算模式</Label>
          <select
            id="type-category"
            className="budgee-input cursor-pointer"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as ExpenseCategory, options: [] }))}
          >
            <option value="split">平均均攤（split）</option>
            <option value="per-item">選項型（per-item）</option>
            <option value="general">通用（general）</option>
          </select>
        </div>

        {formData.category !== 'split' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
              <Label style={{ margin: 0 }}>品項選項</Label>
              <Button type="button" variant="secondary" onClick={handleAddOption} style={{ minHeight: 36, padding: '0 12px', fontSize: '0.9em' }}>
                <Plus size={16} /> 新增品項
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {formData.options.map((opt) => (
                <div key={opt.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Input
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(opt.id, 'label', e.target.value)}
                    placeholder="品項名稱"
                    style={{ flex: 2 }}
                  />
                  <Input
                    type="number"
                    value={opt.price === 0 ? '' : opt.price}
                    onChange={(e) => handleUpdateOption(opt.id, 'price', Number(e.target.value) || 0)}
                    placeholder="單價"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="member-delete"
                    style={{ width: 36, height: 36 }}
                    onClick={() => handleRemoveOption(opt.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {formData.options.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>尚未新增品項</p>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <Button type="button" variant="secondary" className="flex-1" onClick={cancelForm}>取消</Button>
          <Button type="submit" variant="primary" className="flex-1">
            {editingId ? '儲存修改' : '新增類型'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 budgee-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
        <Button variant="ghost" onClick={() => navigate('/')} className="px-2">
          <ArrowLeft size={20} /> 首頁
        </Button>
        <h1 style={{ margin: 0 }}>App 設定</h1>
      </div>

      <div className="space-y-8">
        {/* 內建類型 */}
        <section>
          <h2 className="text-xl font-bold mb-4">預設花費類型（內建）</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {builtInTypes.map((type) =>
              editingId === type.id ? (
                <TypeForm key={type.id} />
              ) : (
                <div key={type.id} className="member-card-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="font-semibold text-xl">{type.name}</span>
                      <span className="budgee-badge badge-secondary" style={{ fontSize: '0.75em' }}>內建</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
                        {CATEGORY_LABELS[type.category]}
                        {type.defaultAll && '・預設全員'}
                      </span>
                    </div>
                    {type.options && type.options.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {type.options.map((opt) => (
                          <span key={opt.id} className="budgee-badge badge-default" style={{ fontSize: '0.8em' }}>
                            {opt.label}{opt.price > 0 ? ` ${fmt(opt.price)}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => handleEditClick(type.id)}
                    aria-label={`編輯 ${type.name}`}
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        {/* 自訂類型 */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h2 className="text-xl font-bold" style={{ margin: 0 }}>自訂類型</h2>
            {!showAddForm && editingId === null && (
              <Button variant="primary" onClick={() => setShowAddForm(true)}>
                <Plus size={18} /> 新增
              </Button>
            )}
          </div>

          {showAddForm && <TypeForm />}

          {customTypes.length === 0 && !showAddForm && (
            <div className="member-empty-state">
              <span>尚無自訂類型</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {customTypes.map((type) =>
              editingId === type.id ? (
                <TypeForm key={type.id} />
              ) : (
                <div key={type.id} className="member-card-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="font-semibold text-xl">{type.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>{CATEGORY_LABELS[type.category]}</span>
                    </div>
                    {type.options && type.options.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {type.options.map((opt) => (
                          <span key={opt.id} className="budgee-badge badge-default" style={{ fontSize: '0.8em' }}>
                            {opt.label}{opt.price > 0 ? ` ${fmt(opt.price)}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      className="member-delete"
                      onClick={() => handleEditClick(type.id)}
                      aria-label={`編輯 ${type.name}`}
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="member-delete"
                      onClick={() => setDeleteConfirmId(type.id)}
                      aria-label={`刪除 ${type.name}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="刪除花費類型"
        description="確定要從全域預設中刪除此類型嗎？已建立的旅行不受影響。"
        confirmText="確定刪除"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};
