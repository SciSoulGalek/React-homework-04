
import { useEffect, useState } from "react";
import {
  getItemsList,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "../fakeApi.js";
import ItemList from "./components/ItemList.jsx";
import ItemDetails from "./components/ItemDetails.jsx";

const categories = ["Operations", "Support", "Security", "Research", "Development"];
const owners = ["Alex Morgan", "Sam Taylor", "Jordan Lee", "Casey Brown"];
const priorities = ["Low", "Medium", "High", "Critical"];

const emptyForm = {
  name: "",
  description: "",
  category: "Operations",
  priority: "Medium",
  owner: "Alex Morgan",
};

function enrichItem(item) {
  const id = Number(item.id) || 1;
  const createdAt =
    item.createdAt || new Date(Date.UTC(2025, 0, (id % 27) + 1)).toISOString();

  return {
    ...item,
    category: item.category || categories[id % categories.length],
    status: item.status || (id % 2 ? "Active" : "Pending"),
    priority: item.priority || priorities[id % priorities.length],
    owner: item.owner || owners[id % owners.length],
    progress: Number.isFinite(item.progress) ? item.progress : (id * 17) % 101,
    createdAt,
    updatedAt: item.updatedAt || createdAt,
  };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function App() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [notice, setNotice] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [detailRetryKey, setDetailRetryKey] = useState(0);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      setListLoading(true);
      setListError("");

      try {
        const result = await getItemsList();

        if (!active) return;

        setItems(result.data);
        setSelectedId((currentId) =>
          result.data.some((item) => item.id === currentId)
            ? currentId
            : result.data[0]?.id ?? null,
        );
      } catch (error) {
        if (active) {
          setListError(error.message || "Could not load items.");
        }
      } finally {
        if (active) setListLoading(false);
      }
    }

    loadItems();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;

    if (selectedId === null) {
      setSelectedItem(null);
      setDetailLoading(false);
      setDetailError("");

      return () => {
        active = false;
      };
    }

    async function loadDetails() {
      setDetailLoading(true);
      setDetailError("");

      try {
        const result = await getItem(selectedId);

        if (active) setSelectedItem(enrichItem(result));
      } catch (error) {
        if (active) {
          setSelectedItem(null);
          setDetailError(error.message || "Could not load item details.");
        }
      } finally {
        if (active) setDetailLoading(false);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [selectedId, detailRetryKey]);

  const visibleItems = items.filter((item) => {
    const query = search.trim().toLowerCase();

    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const currentItem =
    selectedItem?.id === selectedId ? selectedItem : null;

  function showNotice(type, message) {
    setNotice({ type, message });
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function closeForm() {
    setEditing(false);
    setCreating(false);
  }

  function selectItem(id) {
    setSelectedId(id);
    closeForm();
    setNotice(null);
  }

  function startCreate() {
    setCreating(true);
    setEditing(false);
    setForm(emptyForm);
    setNotice(null);
  }

  function startEdit() {
    if (!currentItem) return;

    setEditing(true);
    setCreating(false);
    setForm({
      name: currentItem.name,
      description: currentItem.description,
      category: currentItem.category,
      priority: currentItem.priority,
      owner: currentItem.owner,
    });
    setNotice(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (actionBusy) return;

    const values = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      owner: form.owner,
      updatedAt: new Date().toISOString(),
    };

    if (!values.name || !values.description) {
      showNotice("error", "Name and description are required.");
      return;
    }

    setActionBusy(true);
    setNotice(null);

    try {
      if (!creating) {
        const targetId = selectedId;
        if (targetId === null) return;

        const existing = enrichItem(currentItem);
        const updated = await updateItem(targetId, {
          ...existing,
          ...values,
        });

        setItems((current) =>
          current.map((item) =>
            item.id === targetId ? { ...item, ...updated } : item,
          ),
        );

        setSelectedItem((current) =>
          current?.id === targetId ? enrichItem(updated) : current,
        );

        closeForm();
        showNotice("success", "Item updated successfully.");
      } else {
        const created = await createItem({
          name: values.name,
          description: values.description,
        });

        const now = new Date().toISOString();

        const saved = await updateItem(
          created.id,
          enrichItem({
            ...created,
            ...values,
            status: "Pending",
            progress: 0,
            createdAt: now,
            updatedAt: now,
          }),
        );

        setItems((current) => [...current, saved]);
        setSelectedId(saved.id);
        setSelectedItem(enrichItem(saved));
        closeForm();
        setForm(emptyForm);
        showNotice("success", "New item created successfully.");
      }
    } catch (error) {
      showNotice("error", error.message || "The operation failed.");
      setReloadKey((key) => key + 1);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete() {
    const targetId = selectedId;

    if (targetId === null || actionBusy) return;

    const confirmed = window.confirm(
      `Delete "${currentItem?.name || "this item"}"?`,
    );

    if (!confirmed) return;

    setActionBusy(true);
    setNotice(null);

    try {
      await deleteItem(targetId);

      const remaining = items.filter((item) => item.id !== targetId);

      setItems(remaining);
      setSelectedItem((current) =>
        current?.id === targetId ? null : current,
      );
      setSelectedId((current) =>
        current === targetId ? remaining[0]?.id ?? null : current,
      );
      closeForm();
      showNotice("success", "Item deleted successfully.");
    } catch (error) {
      showNotice("error", error.message || "Could not delete item.");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReview() {
    const targetId = selectedId;

    if (targetId === null || actionBusy || !currentItem) return;

    setActionBusy(true);
    setNotice(null);

    const changes = {
      ...currentItem,
      status: "Reviewed",
      progress: 100,
      updatedAt: new Date().toISOString(),
    };

    try {
      const updated = await updateItem(targetId, changes);

      setItems((current) =>
        current.map((item) =>
          item.id === targetId ? { ...item, ...updated } : item,
        ),
      );

      setSelectedItem((current) =>
        current?.id === targetId ? enrichItem(updated) : current,
      );

      showNotice("success", "Item marked as reviewed.");
    } catch (error) {
      showNotice("error", error.message || "Could not update the item.");
    } finally {
      setActionBusy(false);
    }
  }

  function reloadItems() {
    setNotice(null);
    setReloadKey((key) => key + 1);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="AsyncDesk home">
          <span className="brand-mark">A</span>
          <span>AsyncDesk</span>
        </a>

        <div className="topbar-right">
          <span className="connection-indicator">
            <span className="indicator-dot" />
            Simulated API
          </span>
          <button
            className="button button-secondary"
            onClick={reloadItems}
            disabled={listLoading || actionBusy}
          >
            <span className={listLoading ? "refresh-icon spinning" : "refresh-icon"}>
              ↻
            </span>
            Reload
          </button>
        </div>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE / OVERVIEW</p>
          <h1>Item management</h1>
          <p className="page-description">
            Manage records, inspect details, and track their progress.
          </p>
        </div>

        <button
          className="button button-primary"
          onClick={startCreate}
          disabled={actionBusy}
        >
          <span className="plus-icon">＋</span>
          New item
        </button>
      </section>

      {notice && (
        <div className={`notice notice-${notice.type}`} role="status">
          <span>{notice.type === "success" ? "✓" : "!"}</span>
          {notice.message}
          <button
            className="notice-close"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total items</span>
          <span className="stat-value">
            {listLoading ? "—" : items.length}
          </span>
          <span className="stat-footnote">Records in your workspace</span>
        </article>

        <article className="stat-card">
          <span className="stat-label">Active items</span>
          <span className="stat-value">
            {listLoading
              ? "—"
              : items.filter((item) => enrichItem(item).status === "Active").length}
          </span>
          <span className="stat-footnote">Currently in progress</span>
        </article>

        <article className="stat-card">
          <span className="stat-label">Reviewed</span>
          <span className="stat-value">
            {listLoading
              ? "—"
              : items.filter((item) => enrichItem(item).status === "Reviewed").length}
          </span>
          <span className="stat-footnote">Completed review actions</span>
        </article>

        <article className="stat-card">
          <span className="stat-label">Visible records</span>
          <span className="stat-value">{visibleItems.length}</span>
          <span className="stat-footnote">Matching your search</span>
        </article>
      </section>

      <section className="workspace">
        <ItemList
          items={items}
          visibleItems={visibleItems.map(enrichItem)}
          selectedId={selectedId}
          search={search}
          setSearch={setSearch}
          listLoading={listLoading}
          listError={listError}
          reloadItems={reloadItems}
          onSelect={selectItem}
        />

        <section className="panel details-panel">
          <ItemDetails
            currentItem={currentItem}
            detailLoading={detailLoading}
            detailError={detailError}
            editing={editing}
            creating={creating}
            form={form}
            updateForm={updateForm}
            actionBusy={actionBusy}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            onEdit={startEdit}
            onDelete={handleDelete}
            onReview={handleReview}
            onCreate={startCreate}
            onRetry={() => setDetailRetryKey((key) => key + 1)}
            categories={categories}
            priorities={priorities}
            owners={owners}
            formatDate={formatDate}
          />
        </section>
      </section>

      <footer className="app-footer">
        <span>
          AsyncDesk <span className="footer-separator">/</span> React async practice
        </span>
        <span>Requests are simulated locally using Promises</span>
      </footer>
    </main>
  );
}

export default App;
