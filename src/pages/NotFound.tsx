import { Button, Layout, Result } from "antd";

import { useGoBack } from "@/hooks/useGoBack";
import { routeTree } from "@/utils/routes";

export const NotFoundPage = () => {
  const goBack = useGoBack();

  return (
    <Layout>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button onClick={() => goBack(routeTree.root.path)}>Back Home</Button>
        }
      />
    </Layout>
  );
};
