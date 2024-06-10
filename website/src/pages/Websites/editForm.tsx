import { updateWebsite } from '@/services/website';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';

type EditWebsiteFormProps = {
  record: API.Website;
  afterSubmit: () => void;
};

const EditWebsiteForm: React.FC<EditWebsiteFormProps> = ({
  afterSubmit,
  record,
}) => {
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
        title="编辑规则"
        trigger={<a>编辑</a>}
        form={form}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
        }}
        submitTimeout={2000}
        onOpenChange={() => {
          form.setFieldsValue(record);
        }}
        onFinish={async (params) => {
          const res = await updateWebsite(params);
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
            label="规则名称"
            placeholder="请输入名称"
            disabled
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

export default EditWebsiteForm;
