import { Search, Shield, Flag, Package } from 'lucide-react';

const iconMap = { blue: Search, green: Shield, red: Flag, orange: Package };
const iconComponents = { blue: Search, green: Shield, red: Flag, orange: Package };

export default function StatCard({ icon, color, value, label }) {
  const Icon = iconComponents[color] || Search;
  return (
    <div className="card stat-card">
      <div className={`stat-icon ${color}`}>
        {icon || <Icon size={20} />}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
