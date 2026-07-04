import { useState, useEffect } from "react";
import { fetchUsers } from "../services/fakeApi";
import { formatDate } from "../utils/helpers";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";
import Loader from "../components/Loader";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
        const res = await fetchUsers(token);
        setUsers(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader fullPage message="Loading users..." />;

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-panel" style={{ padding: "1.5rem" }}>
          <h2 className="admin-page__title">Users unavailable</h2>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Users Directory</h1>
          <p className="text-muted">Manage your customer accounts.</p>
        </div>
        <div className="admin-header-actions">
          <input
            type="text"
            className="form-input admin-search-input"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-cell">
                      <img src={user.avatar} alt={user.name} />
                      <div>
                        <div className="admin-user-cell__name">{user.name}</div>
                        <div className="admin-user-cell__email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${user.role === "admin" ? "bg-warning text-warning-dark" : "bg-primary text-primary-dark"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.joinedAt)}</td>
                  <td>
                    <span className={`admin-badge ${user.isActive ? "bg-success text-success-dark" : "bg-danger text-danger-dark"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => alert(`View details for ${user.name}`)}>View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: "3rem" }}>No users found matching "{search}"</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
