export default function ErrorBanner({ children, tone = "warning" }) {
  return (
    <div className={`forecast-error`}>
      {children}
    </div>
  );
}
