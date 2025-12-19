export interface MobileNavProps {
  totalItems: number;
  isOpen: boolean;
  onClose: () => void;
  onUserClick: () => void;
  showAuthPopup: boolean;
    lang: "en" | "ar";
  toggleLang: () => void;
  

}
export interface DesktopNavProps {
  totalItems: number;
  onUserClick: () => void;
  onMenuToggle: () => void;
  showAuthPopup?: boolean; // جعله اختياريًا إذا لم يكن ضروريًا
    lang: "en" | "ar";
  toggleLang: () => void;
}