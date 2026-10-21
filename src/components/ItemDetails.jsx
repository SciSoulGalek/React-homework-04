import ItemForm from "./ItemForm.jsx";
function ItemDetails({
  currentItem,
  detailLoading,
  detailError,
  editing,
  creating,
  form,
  updateForm,
  actionBusy,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
  onReview,
  onCreate,
  onRetry,
  categories,
  priorities,
  owners,
  formatDate,
}) {
  if (editing || creating) {
    return (
      <ItemForm
        creating={creating}
        form={form}
        updateForm={updateForm}
        actionBusy={actionBusy}
        onSubmit={onSubmit}
        onCancel={onCancel}
        categories={categories}
        priorities={priorities}
        owners={owners}
      />
    );
  }

  if (detailLoading) {
    return (
      <div className="detail-state">
        <span className="loader" />
        <h2>Loading details</h2>
        <p>Fetching the selected record from the simulated API.</p>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="detail-state state-error">
        <span className="state-symbol">!</span>
        <h2>Could not load details</h2>
        <p>{detailError}</p>
        <button className="button button-primary" onClick={onRetry}>
          Retry selection
        </button>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="detail-state">
        <span className="empty-illustration">↗</span>
        <h2>Nothing selected</h2>
        <p>Select an item from the list or create a new record.</p>
        <button
          className="button button-primary"
          onClick={onCreate}
          disabled={actionBusy}
        >
          Create an item
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="panel-heading detail-heading">
        <div>
          <p className="eyebrow">RECORD DETAILS</p>
          <h2>{currentItem.name}</h2>
          <p className="muted-text">Record ID: #{currentItem.id}</p>
        </div>
        <button
          className="icon-button"
          onClick={onEdit}
          disabled={actionBusy}
          aria-label="Edit item"
          title="Edit item"
        >
          ✎
        </button>
      </div>

      <div className="detail-summary">
        <div className="summary-icon">
          {currentItem.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="summary-content">
          <h3>{currentItem.name}</h3>
          <p>{currentItem.description}</p>
          <div className="summary-badges">
            <span
              className={`status-badge status-badge-${currentItem.status.toLowerCase()}`}
            >
              <span
                className={`status-dot status-${currentItem.status.toLowerCase()}`}
              />
              {currentItem.status}
            </span>
            <span
              className={`priority-badge priority-${currentItem.priority.toLowerCase()}`}
            >
              {currentItem.priority} priority
            </span>
          </div>
        </div>
      </div>

      <div className="section-title">
        <h3>Information</h3>
        <span>Item properties</span>
      </div>

      <div className="properties-grid">
        <div className="property">
          <span className="property-icon">▦</span>
          <div>
            <span className="property-label">Category</span>
            <strong>{currentItem.category}</strong>
          </div>
        </div>

        <div className="property">
          <span className="property-icon">♙</span>
          <div>
            <span className="property-label">Assigned owner</span>
            <strong>{currentItem.owner}</strong>
          </div>
        </div>

        <div className="property">
          <span className="property-icon">◷</span>
          <div>
            <span className="property-label">Created</span>
            <strong>{formatDate(currentItem.createdAt)}</strong>
          </div>
        </div>

        <div className="property">
          <span className="property-icon">↻</span>
          <div>
            <span className="property-label">Last updated</span>
            <strong>{formatDate(currentItem.updatedAt)}</strong>
          </div>
        </div>

        <div className="property">
          <span className="property-icon">#</span>
          <div>
            <span className="property-label">Identifier</span>
            <strong>
              ITEM-{String(currentItem.id).padStart(4, "0")}
            </strong>
          </div>
        </div>

        <div className="property">
          <span className="property-icon">✓</span>
          <div>
            <span className="property-label">Review status</span>
            <strong>
              {currentItem.status === "Reviewed"
                ? "Completed"
                : "Awaiting review"}
            </strong>
          </div>
        </div>
      </div>

      <div className="section-title progress-title">
        <h3>Progress</h3>
        <strong>{currentItem.progress}%</strong>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-label="Item progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={currentItem.progress}
      >
        <div
          className="progress-fill"
          style={{ width: `${currentItem.progress}%` }}
        />
      </div>

      <p className="progress-caption">
        {currentItem.progress === 100
          ? "This item has completed its review."
          : "Mark this item as reviewed to complete its progress."}
      </p>

      <div className="detail-actions">
        <button
          className="button button-secondary"
          onClick={onEdit}
          disabled={actionBusy}
        >
          Edit item
        </button>
        <button
          className="button button-danger"
          onClick={onDelete}
          disabled={actionBusy}
        >
          Delete
        </button>
        <button
          className="button button-primary"
          onClick={onReview}
          disabled={actionBusy || currentItem.status === "Reviewed"}
        >
          {actionBusy
            ? "Working..."
            : currentItem.status === "Reviewed"
              ? "Reviewed ✓"
              : "Mark reviewed"}
        </button>
      </div>
    </>
  );
}

export default ItemDetails;
