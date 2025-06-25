import Link from 'next/link';
import Nav from './Nav';
import Icon from './Icon';

export default function Header() {
  return (
    <>
      <header className="header shadow">
        <div className="header__container">
          <Link className="logo" href="/">
            <Icon name="logo" />
          </Link>
          <Nav />
        </div>
      </header>
    </>
  );
}
