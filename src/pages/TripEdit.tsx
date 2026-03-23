import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTripStore } from '../stores/tripStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ArrowLeft } from 'lucide-react';

export const TripEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { createTrip, getTrip, updateTrip } = useTripStore();

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    currency: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      getTrip(id).then((trip) => {
        if (trip) {
          setForm({
            title: trip.title,
            description: trip.description,
            startDate: trip.startDate,
            endDate: trip.endDate,
            currency: trip.currency,
          });
        }
      });
    }
  }, [id, isEditing, getTrip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('請填寫旅行標題');
      return;
    }
    if (!form.startDate) {
      setError('請選擇開始日期');
      return;
    }
    if (!form.endDate) {
      setError('請選擇結束日期');
      return;
    }
    setError('');

    try {
      if (isEditing && id) {
        await updateTrip(id, form);
        navigate(`/trip/${id}`);
      } else {
        const newId = await createTrip({
          ...form,
          members: [],
          expenseTypes: [],
        });
        navigate(`/trip/${newId}`); // Redirect to trip details
      }
    } catch (err) {
      console.error(err);
      setError('儲存失敗');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 budgee-page">
      <header className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="px-2">
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-3xl">{isEditing ? '編輯旅行' : '新增旅行'}</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <Label htmlFor="title">旅行標題 <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="例如：阿里山三日遊"
            error={!!error}
          />
          {error && <p className="text-red-500 mt-2 font-medium">{error}</p>}
        </div>

        <div>
          <Label htmlFor="description">描述（選填）</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="旅行備註或說明"
          />
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="startDate">開始日期 <span className="text-red-500">*</span></Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => {
                const newStart = e.target.value;
                setForm({
                  ...form,
                  startDate: newStart,
                  endDate: form.endDate && form.endDate < newStart ? newStart : form.endDate,
                });
              }}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="endDate">結束日期 <span className="text-red-500">*</span></Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
            取消
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            儲存
          </Button>
        </div>
      </form>
    </div>
  );
};
