import { Empty, Layout } from "antd";
import { FC, useEffect } from "react";

import { useCore } from "@/hooks/useCore";

const { Content } = Layout;

export const SettingsPage: FC = () => {
  const { setCurrentPage } = useCore();

  const componentDidMount = () => {
    setCurrentPage("settings");
  };

  useEffect(componentDidMount, []);

  return (
    <Content className="settings-page">
      <Empty />
    </Content>
  );
};
