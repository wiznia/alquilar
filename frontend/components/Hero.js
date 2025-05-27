import Link from 'next/link';

export default function Hero() {
  return (
    <div className="hero">
      <img src="/static/hero.jpg" alt="Hero" />
      <h1>Encontrá y gestioná tus alquileres de manera simple y segura.</h1>
      <h6>
        Con Alquil.AR podés buscar tu hogar ideal y gestionar todo lo
        <br />
        relacionado con tu alquiler sin moverte de tu casa! <br />
        Decile chau a las inmobiliarias!
      </h6>
      <Link className="button" href="/faqs">
        Seguís con dudas?
      </Link>
    </div>
  );
}
