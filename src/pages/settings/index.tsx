import { FC, useEffect } from "react";
// import { useTranslation } from "react-i18next";
import { Empty, Layout } from "antd";

import { useBaseContext } from "context";
import { PageKey } from "utils/constants";

const { Content } = Layout;

const Component: FC = () => {
  // const { t } = useTranslation();
  const { changePage } = useBaseContext();

  const componentDidMount = () => {
    changePage(PageKey.SETTINGS);
  };

  useEffect(componentDidMount, []);

  return (
    <Content className="settings-page">
      <Empty />
    </Content>
  );
};

export default Component;
