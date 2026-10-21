"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main" className="page error-page"><p className="eyebrow">Something interrupted the movement.</p><h1 tabIndex={-1}>TRY AGAIN.</h1><button className="button" onClick={reset}>Reload this page <span>↻</span></button></main>; }
