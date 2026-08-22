import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  circle?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  circle = false,
  style = {},
  className = '',
}) => {
  const customStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : '16px',
    borderRadius: circle ? '50%' : borderRadius !== undefined ? (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius) : '6px',
    ...style,
  };

  return <div className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`} style={customStyle} />;
};

/**
 * Skeleton for stat metrics cards (e.g. Dashboard, Finances)
 */
export const SkeletonStatGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-stat-card">
          <Skeleton circle width={48} height={48} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton width="45%" height={12} />
            <Skeleton width="75%" height={22} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for data tables (Students, Invoices, Absences, etc.)
 */
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 6, columns = 5, showHeader = true }) => {
  return (
    <div style={{
      background: 'var(--surface-color, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '12px',
      overflow: 'hidden',
      padding: '16px'
    }}>
      {/* Table toolbar placeholder */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <Skeleton width="220px" height="38px" borderRadius={8} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton width="100px" height="38px" borderRadius={8} />
          <Skeleton width="120px" height="38px" borderRadius={8} />
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {showHeader && (
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color, #e2e8f0)' }}>
              {Array.from({ length: columns }).map((_, c) => (
                <th key={c} style={{ padding: '12px 16px' }}>
                  <Skeleton width={c === 0 ? '60%' : '80%'} height={14} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} style={{ padding: '14px 16px' }}>
                  {c === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Skeleton circle width={32} height={32} />
                      <div style={{ flex: 1 }}>
                        <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
                        <Skeleton width="60%" height={10} />
                      </div>
                    </div>
                  ) : c === columns - 1 ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <Skeleton width={32} height={32} borderRadius={6} />
                      <Skeleton width={32} height={32} borderRadius={6} />
                    </div>
                  ) : (
                    <Skeleton width={`${Math.floor(50 + ((r + c) * 11) % 45)}%`} height={14} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Skeleton for Card Grids (e.g. Classes, Cards)
 */
export const SkeletonCardGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px'
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="55%" height={20} />
            <Skeleton width="25%" height={20} borderRadius={12} />
          </div>
          <Skeleton width="85%" height={14} />
          <Skeleton width="65%" height={14} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
            <Skeleton width="40%" height={16} />
            <Skeleton width="30%" height={28} borderRadius={6} />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Parent Portal - "Mes Enfants" Tab
 */
export const SkeletonParentChildren: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--surface-color, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Skeleton circle width={64} height={64} />
            <div style={{ flex: 1 }}>
              <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />
              <Skeleton width="45%" height={14} style={{ marginBottom: 6 }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <Skeleton width={70} height={20} borderRadius={10} />
                <Skeleton width={80} height={20} borderRadius={10} />
              </div>
            </div>
          </div>
          <div style={{
            background: 'var(--surface-color-hover, #f8fafc)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-around',
            gap: '12px'
          }}>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <Skeleton width="80%" height={12} style={{ margin: '0 auto 6px' }} />
              <Skeleton width="60%" height={18} style={{ margin: '0 auto' }} />
            </div>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <Skeleton width="80%" height={12} style={{ margin: '0 auto 6px' }} />
              <Skeleton width="60%" height={18} style={{ margin: '0 auto' }} />
            </div>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <Skeleton width="80%" height={12} style={{ margin: '0 auto 6px' }} />
              <Skeleton width="60%" height={18} style={{ margin: '0 auto' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <Skeleton width="100%" height={38} borderRadius={8} />
            <Skeleton width="100%" height={38} borderRadius={8} />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Weekly Schedules
 */
export const SkeletonSchedule: React.FC = () => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return (
    <div style={{
      background: 'var(--surface-color, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '12px',
      padding: '16px',
      overflowX: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Skeleton width="200px" height="36px" borderRadius={8} />
        <Skeleton width="140px" height="36px" borderRadius={8} />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px repeat(6, 1fr)',
        gap: '8px',
        minWidth: '700px'
      }}>
        <div style={{ padding: '8px', fontWeight: 'bold' }}>
          <Skeleton width="100%" height={20} />
        </div>
        {days.map((_, i) => (
          <div key={i} style={{ padding: '8px', textAlign: 'center' }}>
            <Skeleton width="80%" height={20} style={{ margin: '0 auto' }} />
          </div>
        ))}
        {Array.from({ length: 5 }).map((_, r) => (
          <React.Fragment key={r}>
            <div style={{ padding: '12px 4px' }}>
              <Skeleton width="90%" height={14} />
            </div>
            {Array.from({ length: 6 }).map((_, c) => (
              <div key={c} style={{
                background: 'var(--surface-color-hover, #f8fafc)',
                borderRadius: '8px',
                padding: '10px',
                minHeight: '75px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {(r + c) % 2 === 0 ? (
                  <>
                    <Skeleton width="90%" height={14} />
                    <Skeleton width="60%" height={10} />
                    <Skeleton width="50%" height={10} />
                  </>
                ) : null}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Student Dossier Modal
 */
export const SkeletonDossier: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Skeleton circle width={72} height={72} />
        <div style={{ flex: 1 }}>
          <Skeleton width="220px" height={24} style={{ marginBottom: 8 }} />
          <Skeleton width="150px" height={16} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton width={80} height={22} borderRadius={11} />
            <Skeleton width={90} height={22} borderRadius={11} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '10px' }}>
        <Skeleton width={140} height={32} borderRadius={6} />
        <Skeleton width={140} height={32} borderRadius={6} />
        <Skeleton width={140} height={32} borderRadius={6} />
      </div>
      <SkeletonStatGrid count={3} />
      <SkeletonTable rows={4} columns={4} />
    </div>
  );
};
