import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client"
import { createRoot, type Root } from "react-dom/client"
import MainBoard from "./containers/main"

const client = new ApolloClient({
  link: new HttpLink({ uri: "/graphql" }),
  cache: new InMemoryCache(),
})

let reactRoot: Root | null = null
let reactRootElement: HTMLElement | null = null

const mount = () => {
  const root = document.getElementById("app-root")
  if (!root) return

  if (!reactRoot || reactRootElement !== root) {
    reactRoot = createRoot(root)
    reactRootElement = root
  }

  reactRoot.render(
    <ApolloProvider client={client}>
      <MainBoard />
    </ApolloProvider>
  )
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount)
} else {
  mount()
}

if (import.meta.hot) {
  import.meta.hot.accept()
}
