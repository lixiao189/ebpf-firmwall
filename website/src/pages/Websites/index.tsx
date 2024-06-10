import {
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button } from 'antd';

const WebsitesPage: React.FC = () => {
  const columns: ProColumns<API.SiteSetting>[] = [
    {
      title: '网站名称',
      dataIndex: 'name',
    },
    {
      title: 'API 地址',
      dataIndex: 'api',
    },
    {
      title: '上游地址',
      dataIndex: 'upstream',
    },
  ];

  return (
    <PageContainer
      ghost
      header={{
        title: '网站管理',
      }}
    >
      <ProTable<API.SiteSetting>
        cardBordered
        columns={columns}
        search={false}
        options={false}
        toolBarRender={() => [<Button key="add" type="primary">添加网站</Button>]}
      />
    </PageContainer>
  );
};

export default WebsitesPage;
