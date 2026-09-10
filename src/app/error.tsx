"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container empty-state"><h1>Something went wrong</h1><p>Please try again.</p><button className="btn btn-primary" onClick={reset}>Retry</button></div>; }
