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
  const [successMessage, setSuccessMessage] = useState("");

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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    setSuccessMessage(""); // Clear success message when editing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage("");
    try {
      const updatedUser = await updateUser(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        avatar: formData.avatar
      });
      onUserUpdated(updatedUser);
      setSuccessMessage("User updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1500); // Close after 1.5 seconds
    } catch (error) {
      setErrors({ form: "Failed to update user. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setSuccessMessage("");
    try {
      await deleteUser(user.id);
      onUserDeleted(user.id);
      setSuccessMessage("User deleted successfully!");
      setTimeout(() => {
        onClose();
      }, 1500); // Close after 1.5 seconds
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
        {successMessage && (
          <div className="success-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Form fields remain the same */}
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading || !!successMessage}
              className={errors.firstName ? "input-error" : ""}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>
          
          {/* Other form groups... */}
          
          <div className="modal-actions">
            <button 
              type="submit" 
              disabled={loading || !!successMessage}
              className="primary-button"
            >
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
              disabled={loading || !!successMessage}
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