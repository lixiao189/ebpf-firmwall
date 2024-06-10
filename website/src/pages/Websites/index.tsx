import { deleteWebsite, getWebsites } from '@/services/website';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { message } from 'antd';
import { useRef } from 'react';
import AddWebsiteForm from './addForm';
import EditWebsiteForm from './editForm';

const WebsitesPage: React.FC = () => {
  const ref = useRef<ActionType>();
  const [messageApi, contextHolder] = message.useMessage();

  const columns: ProColumns<API.Website>[] = [
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
      dataIndex: 'url',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_text, record, _, _action) => [
        <EditWebsiteForm
          key="edit"
          record={record}
          afterSubmit={function (): void {
            ref.current?.reload();
          }}
        />,
        <a
          key="delete"
          onClick={async () => {
            const res = await deleteWebsite({
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
        title: '网站管理',
      }}
    >
      {contextHolder}
      <ProTable
        request={async () => {
          const res = await getWebsites();
          const data = res.data.map((item) => {
            return {
              ...item,
              key: item.name,
            };
          });
          return {
            data: data,
            success: res.success,
          };
        }}
        cardBordered
        columns={columns}
        search={false}
        options={false}
        actionRef={ref}
        toolBarRender={() => [
          <AddWebsiteForm
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

export default WebsitesPage;
