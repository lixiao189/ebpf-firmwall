import { addWebsite } from '@/services/website';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';

type AddWebsiteFormProps = {
  afterSubmit: () => void;
};

const AddWebsiteForm: React.FC<AddWebsiteFormProps> = ({ afterSubmit }) => {
  const [form] = Form.useForm<{ name: string; api: string; url: string }>();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <ModalForm<{
        name: string;
        api: string;
        url: string;
      }>
        title="新建网站"
        trigger={
          <Button type="primary">
            <PlusOutlined />
            新建网站
          </Button>
        }
        form={form}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
        }}
        submitTimeout={2000}
        onFinish={async (params) => {
          const res = await addWebsite(params);
          if (res.success) {
            afterSubmit();
            messageApi.success('添加成功');
          } else {
            messageApi.error('添加失败');
          }
          return res.success;
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="name"
            label="网站名称"
            placeholder="请输入名称"
          />

          <ProFormText
            width="md"
            name="api"
            label="API"
            placeholder="请输入 API 地址"
          />

          <ProFormText
            width="md"
            name="url"
            label="上游地址"
            placeholder="请输入上游地址"
          />
        </ProForm.Group>
      </ModalForm>
    </>
  );
};

export default AddWebsiteForm;
