import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client"
import { createRoot, type Root } from "react-dom/client"
import DarkModeButton from "./components/DarkModeButton"
import TaskList from "./components/TaskList"

const client = new ApolloClient({
  link: new HttpLink({ uri: "/graphql" }),
  cache: new InMemoryCache(),
})

const App = () => (
  <div>
    <h1>
      Hello from React <DarkModeButton />
    </h1>
    <TaskList />
  </div>
)

let reactRoot: Root | null = null
let reactRootElement: HTMLElement | null = null

const mount = () => {
  const root = document.getElementById("solid-root")
  if (!root) return

  if (!reactRoot || reactRootElement !== root) {
    reactRoot = createRoot(root)
    reactRootElement = root
  }

  reactRoot.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  )
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount)
} else {
  mount()
}

document.addEventListener("turbo:load", mount)

if (import.meta.hot) {
  import.meta.hot.accept()
}
