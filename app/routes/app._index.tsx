import { useState } from "react";
import { json } from "@remix-run/node";

import { 
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";

import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  TextField,
  PageActions,
} from "@shopify/polaris";

import { json, redirect } from "@remix-run/node";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getPayConfig, validatePayConfig, postPayConfig } from "../config.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  return json(await getPayConfig({data: admin.rest.session}));
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    session,
  };

  const errors = validatePayConfig(data);
  if (errors) {
    return json({ errors }, { status: 422 });
  }

  await postPayConfig(data);
  return redirect("/app");
}

export default function Index() {
  const errors = useActionData()?.errors || {};
  const config = useLoaderData();
  const [formState, setFormState] = useState(config);
  const [cleanFormState, setCleanFormState] = useState(config);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";

  const submit = useSubmit();
  function handleSave() {
    const data = {
      liqPayPublicKey: formState.liqPayPublicKey,
      liqPayPrivateKey: formState.liqPayPrivateKey,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <TitleBar title="Welcome to LiqPay application">
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h1" variant="headingMd">
                    IMPORTANT INFORMATION!
                  </Text>
                  <Text variant="bodyMd" as="p">
                    In order to use application, go to admin settings and add manual payment method with name <b>LiqPay</b>.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as={"h3"} variant="headingLg">
                  LiqPay connection configuration
                </Text>
                <TextField
                  id="liqPayPublicKey"
                  helpText="Can be found at LiqPay personal cabinet"
                  label="Public key"
                  autoComplete="off"
                  value={formState.liqPayPublicKey}
                  onChange={(liqPayPublicKey) => setFormState({ ...formState, liqPayPublicKey })}
                  error={errors.title}
                />
                <TextField
                  id="liqPayPrivateKey"
                  helpText="Can be found at LiqPay personal cabinet"
                  label="Private key"
                  type="password"
                  autoComplete="off"
                  value={formState.liqPayPrivateKey}
                  onChange={(liqPayPrivateKey) => setFormState({ ...formState, liqPayPrivateKey })}
                  error={errors.title}
                />
            </BlockStack>
          </Card>
          <PageActions
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving,
              onAction: handleSave,
            }}
            />
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
