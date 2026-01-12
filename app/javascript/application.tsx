import { render } from "solid-js/web"
import DarkModeButton from "./components/DarkModeButton"

const App = () => (
  <h1>
    Hello from Solid.JS <DarkModeButton />
  </h1>
)

render(() => <App />, document.getElementById("solid-root")!)

if (import.meta.hot) {
  import.meta.hot.accept();
}
