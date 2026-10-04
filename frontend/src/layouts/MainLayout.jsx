export default function MainLayout({ children }) {
  return (
    <div>
      <header aria-label="Application header" />
      {children}
      <footer aria-label="Application footer" />
    </div>
  );
}
