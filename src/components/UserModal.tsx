import { useState } from "react";
import { updateUser, deleteUser } from "../services/userservices";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  email: string;
}

interface Props {
  user: User;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
  onUserDeleted: (userId: number) => void;
}

export default function UserModal({ user, onClose, onUserUpdated, onUserDeleted }: Props) {
  const [formData, setFormData] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    avatar: user.avatar
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.firstName.length < 3) {
      newErrors.firstName = "First name must be at least 3 characters";
    }
    
    if (formData.lastName.length < 3) {
      newErrors.lastName = "Last name must be at least 3 characters";
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.avatar) {
      newErrors.avatar = "Avatar URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(formData.avatar)) {
      newErrors.avatar = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedUser = await updateUser(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        avatar: formData.avatar
      });
      onUserUpdated(updatedUser);
      onClose();
    } catch (error) {
      setErrors({ form: "Failed to update user. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      await deleteUser(user.id);
      onUserDeleted(user.id);
      onClose();
    } catch (error) {
      setErrors({ form: "Failed to delete user. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close">
          &times;
        </button>
        
        <div className="modal-header">
          <img 
            src={formData.avatar} 
            alt={`${formData.firstName} ${formData.lastName}`} 
            className="modal-avatar" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
            }}
          />
          <h2>Edit User</h2>
        </div>

        {errors.form && <div className="error-message">{errors.form}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
              className={errors.firstName ? "input-error" : ""}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>
          
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
              className={errors.lastName ? "input-error" : ""}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Avatar URL</label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              disabled={loading}
              className={errors.avatar ? "input-error" : ""}
              placeholder="https://example.com/avatar.jpg"
            />
            {errors.avatar && <span className="error-text">{errors.avatar}</span>}
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button 
              type="button" 
              onClick={handleDelete} 
              disabled={loading}
              className="danger-button"
            >
              Delete User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}