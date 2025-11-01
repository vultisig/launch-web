import { Button, Layout, Result } from "antd";

import { useGoBack } from "@/hooks/useGoBack";
import { VStack } from "@/toolkits/Stack";
import { routeTree } from "@/utils/routes";

export const NotFoundPage = () => {
  const goBack = useGoBack();

  return (
    <VStack
      as={Layout}
      $style={{
        alignItems: "center",
        height: "100vh",
        justifyContent: "center",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button onClick={() => goBack(routeTree.root.path)}>Back Home</Button>
        }
      />
    </VStack>
  );
};
