import "./Loader.css";

export const Spinner = ({ size = "md", color = "primary" }) => (
  <div className={`spinner spinner--${size} spinner--${color}`} aria-label="Loading" />
);

const Loader = ({ fullPage = false, message = "Loading..." }) => {
  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className="loader-fullpage__inner">
          <div className="loader-fullpage__icon">⚡</div>
          <Spinner size="lg" />
          <p className="loader-fullpage__message">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <Spinner />
      <span>{message}</span>
    </div>
  );
};

export default Loader;
