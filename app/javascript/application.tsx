import { render } from "solid-js/web";

const App = () => <h1>Hello from Solid.JS</h1>;

const root =
  document.getElementById("solid-root") ??
  (() => {
    const el = document.createElement("div");
    el.id = "solid-root";
    document.body.appendChild(el);
    return el;
  })();

render(() => <App />, root);

if (import.meta.hot) {
  import.meta.hot.accept();
}
