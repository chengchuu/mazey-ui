import { useState } from "react";
import { ThemeToggle } from "mazey-ui";
import type { ThemeToggleTheme } from "mazey-ui";

export function App() {
  const [ previewTheme, setPreviewTheme ] = useState<ThemeToggleTheme>("light");
  const [ fallbackTheme, setFallbackTheme ] = useState<ThemeToggleTheme>();

  return (
    <main className="container playground-main">
      <header className="playground-intro">
        <p className="text-uppercase fw-semibold text-primary">Interactive example</p>
        <h1>ThemeToggle playground</h1>
        <p>Exercise the controlled component without giving it responsibility for page theme or persistence.</p>
      </header>
      <section className="preview-grid" aria-labelledby="controlled-heading">
        <div>
          <h2 id="controlled-heading">Controlled preview</h2>
          <p>The parent owns the concrete theme and receives the requested next value.</p>
          <div className="component-preview" data-preview-theme={previewTheme}>
            <ThemeToggle
              theme={previewTheme}
              onThemeChange={setPreviewTheme}
              aria-describedby="preview-status"
              title="Change preview theme"
            />
            <span id="preview-status" role="status" aria-live="polite">
              Preview theme: {previewTheme}.
            </span>
          </div>
        </div>
        <div>
          <h2>OS fallback preview</h2>
          <p>Omit the initial theme to read the OS preference once, using Light when unavailable. The parent feeds each requested value back through theme.</p>
          <div className="component-preview" data-preview-theme={fallbackTheme}>
            <ThemeToggle
              theme={fallbackTheme}
              onThemeChange={setFallbackTheme}
              title="Change OS fallback preview theme"
              aria-describedby="fallback-status"
            />
            <span id="fallback-status" role="status" aria-live="polite">
              {fallbackTheme === undefined ? "Preview uses the initial OS fallback." : `OS fallback preview theme: ${fallbackTheme}.`}
            </span>
          </div>
        </div>
        <div>
          <h2>Native button properties</h2>
          <p>Consumers can pass standard button attributes, including disabled state and data attributes.</p>
          <div className="component-preview" data-preview-theme="dark">
            <ThemeToggle theme="dark" onThemeChange={() => undefined} disabled data-example="disabled" />
            <span>Disabled dark-theme control</span>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="code-heading">
        <h2 id="code-heading">Example</h2>
        <pre><code>{`import { useState } from "react";
import { ThemeToggle, type ThemeToggleTheme } from "mazey-ui";
import "mazey-ui/styles.css";

export function ControlledPreview() {
  const [ theme, setTheme ] = useState<ThemeToggleTheme>("light");
  return <ThemeToggle theme={theme} onThemeChange={setTheme} />;
}

export function OSFallbackPreview() {
  const [ theme, setTheme ] = useState<ThemeToggleTheme>();
  return <ThemeToggle theme={theme} onThemeChange={setTheme} />;
}`}</code></pre>
        <p>The fallback is read-only and does not track later OS changes. Without feeding back theme, repeated clicks request the same opposite value. onThemeChange is required; persistence and page-wide theme updates belong to the consumer. For server rendering or hydration, provide an explicit theme.</p>
      </section>
      <section className="section" aria-labelledby="install-heading">
        <h2 id="install-heading">Install this website</h2>
        <button className="btn btn-outline-primary" type="button" data-pwa-install hidden>Install app</button>
        <span className="ms-2" role="status" aria-live="polite" data-pwa-status>Installation is unavailable in this browser or context.</span>
      </section>
    </main>
  );
}
