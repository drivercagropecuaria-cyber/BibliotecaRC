import React, { useState } from 'react';
import styles from './Navbar.module.css';

export interface NavbarProps {
  title?: string;
  onLogoClick?: () => void;
  showUser?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'Biblioteca Digital RC',
  onLogoClick,
  showUser = false,
  userName,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <button
            className={styles.logoButton}
            onClick={onLogoClick}
            aria-label="Home"
          >
            <span className={styles.logoIcon}>📚</span>
            <span className={styles.logoText}>{title}</span>
          </button>
        </div>

        <div className={`${styles.navMenu} ${mobileMenuOpen ? styles.mobile : ''}`}>
          <a href="#biblioteca" className={styles.navLink}>Biblioteca</a>
          <a href="#museum" className={styles.navLink}>Museu 3D</a>
          <a href="#map" className={styles.navLink}>Mapa</a>
          <a href="#sobre" className={styles.navLink}>Sobre</a>
        </div>

        <div className={styles.rightSection}>
          {showUser && (
            <div className={styles.userMenu}>
              {userName && (
                <>
                  <span className={styles.userName}>{userName}</span>
                  <button
                    className={styles.logoutButton}
                    onClick={onLogout}
                    aria-label="Logout"
                  >
                    Sair
                  </button>
                </>
              )}
            </div>
          )}

          <button
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
