import React, { useState } from 'react';

const FilterMenu = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFilterClick = (filter: string) => {
    if (!hasInteracted) {
      // First interaction - select only this filter
      setSelectedFilters([filter]);
      setHasInteracted(true);
      return;
    }

    // Normal toggle behavior after first interaction
    setSelectedFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      }
      return [...prev, filter];
    });
  };

  return (
    <div className="filter-menu">
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => handleFilterClick(filter)}
          className={`filter-button ${selectedFilters.includes(filter) ? 'active' : ''}`}
          aria-pressed={selectedFilters.includes(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FilterMenu; 