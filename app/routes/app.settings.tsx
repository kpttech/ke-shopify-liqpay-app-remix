import { useState } from "react";
import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  TextField,
  PageActions,
} from "@shopify/polaris";

import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";

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
  return redirect("/app/settings");
}

export default function ConfigForm() {
  const errors = useActionData()?.errors || {};
  const config = useLoaderData();
  const [formState, setFormState] = useState(config);
  const [cleanFormState, setCleanFormState] = useState(config);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const navigate = useNavigate();

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
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as={"h2"} variant="headingLg">
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
    </Page>
  );
}
