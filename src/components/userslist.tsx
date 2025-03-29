import { useState, useEffect, useMemo } from "react";
import { fetchUsers } from "../services/userservices";
import UserModal from "./UserModal";
import Pagination from "./pagination";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getAuthToken } from "../utils/auth";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  email: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const data = await fetchUsers(page, token);
        setUsers(data.data);
        setTotalPages(data.total_pages);
      } catch (error) {
        setError("Failed to load users");
        if (error instanceof Error && error.message.includes("401")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [page, navigate]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  const handleUserDeleted = (deletedUserId: number) => {
    setUsers(users.filter(user => user.id !== deletedUserId));
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="user-list-container">
      <div className="header-container">
        <h1 className="user-list-title">User Directory</h1>
        
        {/* Search Bar - Moved to left side in header */}
        <div className="search-bar">
          <span className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="user-grid">
            {filteredUsers.map((user) => (
              <div key={user.id} className="user-card" onClick={() => setSelectedUser(user)}>
                <img 
                  src={user.avatar} 
                  alt={`${user.first_name} ${user.last_name}`} 
                  className="user-avatar" 
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                  }}
                />
                <div className="user-info">
                  <h3>{user.first_name} {user.last_name}</h3>
                  <p>{user.email}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onUserUpdated={handleUserUpdated}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
}