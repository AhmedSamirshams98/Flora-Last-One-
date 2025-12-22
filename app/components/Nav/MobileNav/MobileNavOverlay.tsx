const MobileNavOverlay = ({
  isAnimating,
  onClose,
}: {
  isAnimating: boolean;
  onClose: () => void;
}) => (
  <div
    className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
      isAnimating ? "opacity-100" : "opacity-0"
    }`}
    onClick={onClose}
    aria-hidden="true"
  />
);

export default MobileNavOverlay;
