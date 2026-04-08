import { useAuth } from '../../context/AuthContext';
import { MdMenu, MdLogout, MdNotifications } from 'react-icons/md';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <button className="navbar-menu-btn" onClick={onMenuToggle} id="menu-toggle">
        <MdMenu />
      </button>
      <div className="navbar-spacer" />
      <div className="navbar-actions">
        <button className="navbar-icon-btn" id="notifications-btn" title="Notifications">
          <MdNotifications />
        </button>
        <div className="navbar-user">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span className="user-name">{user?.name}</span>
        </div>
        <button className="navbar-icon-btn logout-btn" onClick={logout} id="logout-btn" title="Logout">
          <MdLogout />
        </button>
      </div>
    </header>
  );
}
