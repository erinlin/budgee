import React, { useEffect } from 'react';
import { useParams, useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useTripStore } from '../../stores/tripStore';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Settings, Users, Receipt, Wallet, User } from 'lucide-react';

export const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTrip, getTrip, isLoading } = useTripStore();

  useEffect(() => {
    if (id) {
      getTrip(id);
    }
  }, [id, getTrip]);

  if (isLoading || !activeTrip) {
    return <div className="p-4 text-center">載入中...</div>;
  }

  const tabs = [
    { name: '花費', path: `/trip/${id}/expenses`, icon: Receipt },
    { name: '收款', path: `/trip/${id}/collections`, icon: Wallet },
    { name: '個人', path: `/trip/${id}/personal`, icon: User },
    { name: '旅伴', path: `/trip/${id}/members`, icon: Users },
    { name: '設定', path: `/trip/${id}/settings`, icon: Settings },
  ];

  return (
    <div className="max-w-2xl mx-auto budgee-page">
      <header className="budgee-trip-header">
        <div className="budgee-trip-header-top">
          <Button variant="ghost" onClick={() => navigate('/')} className="px-2">
            <ArrowLeft size={24} />
          </Button>
          <h1 className="budgee-trip-title">
            {activeTrip.title}
            {activeTrip.archived && (
              <span style={{ fontSize: '0.55em', fontWeight: 500, marginLeft: 8, background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 12, verticalAlign: 'middle' }}>
                已封存
              </span>
            )}
          </h1>
          <div style={{ minWidth: 48 }} />
        </div>

        <nav className="budgee-trip-tabs">
          {tabs.map((tab) => {
            const isActive = location.pathname.includes(tab.path.split('/').pop()!);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`budgee-trip-tab${isActive ? ' active' : ''}`}
              >
                <Icon size={18} />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};
