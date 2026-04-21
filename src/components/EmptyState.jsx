import { Search } from 'lucide-react';

export default function EmptyState({ icon, title, description }) {
  return (
    <div className="card empty-state">
      <div className="empty-icon">
        {icon || <Search size={28} />}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
