import './MainTemplate.css';

export default function MainTemplate({ title, description, children }) {
  return (
    <main className="main-template">
      <header className="main-template__intro">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}
