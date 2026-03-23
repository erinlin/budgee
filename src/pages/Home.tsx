import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripStore } from '../stores/tripStore';
import { Button } from '../components/ui/Button';
import { Plus, Archive, ChevronRight, Calendar } from 'lucide-react';

export const Home: React.FC = () => {
  const { trips, loadTrips, isLoading } = useTripStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  if (isLoading) {
    return <div className="p-4 text-center">載入中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 budgee-page">
      <header className="flex items-center justify-between mb-8">
        <h1>我的旅行</h1>
        <Button onClick={() => navigate('/trip/new')} variant="primary" className="gap-2">
          <Plus size={20} /> 新增旅行
        </Button>
      </header>

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
              className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-shadow"
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
    </div>
  );
};
