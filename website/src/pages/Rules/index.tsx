import { deleteRule, getRules } from '@/services/rule';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { message } from 'antd';
import { useRef } from 'react';
import AddRuleForm from './addForm';
import EditRuleForm from './editForm';

const RulePage: React.FC = () => {
  const ref = useRef<ActionType>();
  const [messageApi, contextHolder] = message.useMessage();

  const columns: ProColumns<API.Rule>[] = [
    {
      title: '规则名称',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '匹配规则',
      key: 'regex',
      dataIndex: 'regex',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_text, record, _, _action) => [
        <EditRuleForm
          key="edit"
          record={record}
          afterSubmit={function (): void {
            ref.current?.reload();
          }}
        />,
        <a
          key="delete"
          onClick={async () => {
            const res = await deleteRule({
              name: record.name,
            });
            if (res.success) {
              messageApi.success('删除成功');
              ref.current?.reload();
            } else {
              messageApi.error('删除失败');
            }
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <PageContainer
      ghost
      header={{
        title: '规则管理',
      }}
    >
      {contextHolder}
      <ProTable
        cardBordered
        actionRef={ref}
        columns={columns}
        search={false}
        options={false}
        request={async (_params, _sort, _filter) => {
          const res = await getRules();
          const data = res.data.map((item) => {
            return {
              key: item.name,
              name: item.name,
              regex:
                item.regex.length > 20
                  ? item.regex.slice(0, 20) + '...'
                  : item.regex,
            };
          });
          return { data: data, success: res.success };
        }}
        toolBarRender={() => [
          <AddRuleForm
            key="add"
            afterSubmit={() => {
              ref.current?.reload();
            }}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default RulePage;
