import {
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button } from 'antd';

const RulePage: React.FC = () => {
  const columns: ProColumns<API.Rule>[] = [
    {
      title: '规则名称',
      dataIndex: 'name',
    },
    {
      title: '匹配规则',
      dataIndex: 'regex',
    },
  ];

  return (
    <PageContainer
      ghost
      header={{
        title: '规则管理',
      }}
    >
      <ProTable<API.Rule>
        cardBordered
        columns={columns}
        search={false}
        options={false}
        toolBarRender={() => [<Button type="primary">添加规则</Button>]}
      />
    </PageContainer>
  );
};

export default RulePage;
