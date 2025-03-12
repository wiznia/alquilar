export default function Footer() {
  const date = new Date();
  const year = date.getFullYear();
  return(
    <footer className="footer">
      <p>Alquil.AR - {year}</p>
    </footer>
  );
}
