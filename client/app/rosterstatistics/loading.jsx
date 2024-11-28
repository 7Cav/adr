import "./page.css";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="gif-spinner-wrapper">
        <div className="spinner"></div>
        {/*This gif is about 150kb. Kinda big, relatively speaking. An Svg may be desired in the furture */}
        <img
          className="p-loading-png"
          src={"/hamster-hamtaro.gif"}
          alt="Loading"
        />
      </div>
      <div className="loading-subtitle">Loading...</div>
    </div>
  );
}
