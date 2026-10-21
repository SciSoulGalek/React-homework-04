function ItemForm({
  creating,
  form,
  updateForm,
  actionBusy,
  onSubmit,
  onCancel,
  categories,
  priorities,
  owners,
}) {
  return (
    <>
      <div className="panel-heading detail-heading">
        <div>
          <p className="eyebrow">
            {creating ? "NEW RECORD" : "EDIT RECORD"}
          </p>
          <h2>{creating ? "Create an item" : "Edit item"}</h2>
          <p className="muted-text">
            Fill in the fields below and save your changes.
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onCancel}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      <form className="item-form" onSubmit={onSubmit}>
        <label>
          Item name
          <input
            name="name"
            value={form.name}
            onChange={updateForm}
            placeholder="Enter a name"
            maxLength={100}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={updateForm}
            placeholder="Describe this item"
            rows={3}
            maxLength={500}
            required
          />
        </label>

        <div className="form-grid">
          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={updateForm}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={updateForm}
            >
              {priorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Assigned owner
          <select
            name="owner"
            value={form.owner}
            onChange={updateForm}
          >
            {owners.map((owner) => (
              <option key={owner}>{owner}</option>
            ))}
          </select>
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onCancel}
            disabled={actionBusy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={actionBusy}
          >
            {actionBusy
              ? "Saving..."
              : creating
                ? "Create item"
                : "Save changes"}
          </button>
        </div>
      </form>
    </>
  );
}

export default ItemForm;
