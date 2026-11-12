import Link from "next/link";

export default function NotFound() {
  return (
    <header className="vhead">
      <p className="eyebrow mono">404</p>
      <h1>Nothing at this address</h1>
      <p className="lede">The page you asked for is not part of this universe.</p>
      <div className="ctl"><Link className="btn" href="/">Back to the Universe</Link><Link className="btn ghost" href="/projects">Open the Multiverse</Link></div>
    </header>
  );
}
