import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function PaymentsPage() {
  return (
    <Page>
      <TitleBar title="LiqPay Payments" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                LiqPay payment requests and transactions lists are comming soon...
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
