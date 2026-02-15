import './Spinner.css';

const Spinner = ({ size = 'medium', color = 'primary', text = '', showLogo = false }) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className={`spinner spinner-${color}`} role="status" aria-label="Loading">
        <div className="spinner-circle"></div>
        {showLogo && (
          <img
            src="/assets/RSlogo.png"
            alt="RS Logo"
            className="spinner-logo"
          />
        )}
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
