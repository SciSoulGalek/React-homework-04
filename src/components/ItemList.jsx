function ItemList({
  items,
  visibleItems,
  selectedId,
  search,
  setSearch,
  listLoading,
  listError,
  reloadItems,
  onSelect,
}) {
  return (
    <aside className="panel list-panel">
      <div className="panel-heading">
        <div>
          <h2>All items</h2>
          <p className="muted-text">Select a record to view its details</p>
        </div>
        <span className="count-badge">{items.length}</span>
      </div>

      <label className="search-box">
        <span className="search-icon">⌕</span>
        <input
          type="search"
          placeholder="Search items..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {listLoading ? (
        <div className="state-message">
          <span className="loader" />
          <strong>Loading records</strong>
          <span>Waiting for the simulated API...</span>
        </div>
      ) : listError ? (
        <div className="state-message state-error">
          <span className="state-symbol">!</span>
          <strong>Unable to load items</strong>
          <span>{listError}</span>
          <button
            className="button button-secondary"
            onClick={reloadItems}
          >
            Try again
          </button>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="state-message">
          <span className="state-symbol">⌕</span>
          <strong>No items found</strong>
          <span>
            {items.length
              ? "Try another search."
              : "Create your first item to get started."}
          </span>
        </div>
      ) : (
        <div className="item-list">
          {visibleItems.map((item) => {
            const active = selectedId === item.id;

            return (
              <button
                key={item.id}
                className={`item-row ${active ? "item-row-active" : ""}`}
                onClick={() => onSelect(item.id)}
              >
                <span className="avatar">
                  {item.name.slice(0, 1).toUpperCase()}
                </span>

                <span className="item-row-content">
                  <span className="item-row-title">{item.name}</span>
                  <span className="item-row-description">
                    {item.description}
                  </span>
                  <span className="item-row-meta">
                    <span
                      className={`status-dot status-${(item.status || "Pending").toLowerCase()}`}
                    />
                    {item.status || "Pending"}
                    <span className="meta-separator">·</span>
                    {item.category || "Operations"}
                  </span>
                </span>

                <span className="row-chevron">›</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="list-footer">
        <span>
          {visibleItems.length} of {items.length} records
        </span>
        <span className="api-latency">Async requests enabled</span>
      </div>
    </aside>
  );
}

export default ItemList;
