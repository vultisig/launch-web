import { Empty, Layout } from "antd";
import { FC, useEffect } from "react";

import { useCore } from "@/hooks/useCore";

const { Content } = Layout;

export const SettingsPage: FC = () => {
  const { setCurrentPage } = useCore();

  useEffect(() => {
    setCurrentPage("settings");
  }, []);

  return (
    <Content>
      <Empty />
    </Content>
  );
};
