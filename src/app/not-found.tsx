import Link from "next/link";
export default function NotFound() {
  return <main id="main" className="page error-page"><p className="eyebrow">404 / Off the record</p><h1 tabIndex={-1}>LOST IN<br />THE NORTH?</h1><Link href="/" className="button">Return home </Link></main>;
}
