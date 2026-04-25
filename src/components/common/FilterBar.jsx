import { Search, X } from 'lucide-react';

const FilterBar = ({ searchTerm, setSearchTerm, placeholder = 'Buscar...', children, onExport, onClear }) => {
  return (
    <div className="filter-bar">
      <div className="filter-search">
        <Search size={18} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-btn" onClick={() => setSearchTerm('')}>
            <X size={14} />
          </button>
        )}
      </div>
      <div className="filter-extra">
        {children}
      </div>
      <div className="filter-actions">
        <button className="btn btn-secondary" onClick={onClear}>Limpiar filtros</button>
        <button className="btn btn-primary" onClick={onExport}>Exportar a Excel</button>
      </div>
    </div>
  );
};

export default FilterBar;