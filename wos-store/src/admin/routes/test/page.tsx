import { Container, Heading } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"

const TestPage = () => {
  return (
    <Container>
      <Heading>Test Page</Heading>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Test",
})

export default TestPage
