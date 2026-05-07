function Spinner({ size = 20 }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
    />
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size={36} />
    </div>
  );
}

export { Spinner, PageLoader };
