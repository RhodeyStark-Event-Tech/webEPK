import './Spinner.css';

const Spinner = ({ size = 'medium', color = 'primary', text = '' }) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className={`spinner spinner-${color}`} role="status" aria-label="Loading">
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
