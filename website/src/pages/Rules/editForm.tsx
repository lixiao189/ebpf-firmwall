import { updateRule } from '@/services/rule';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';

type EditRuleFormProps = {
  record: API.Rule;
  afterSubmit: () => void;
};

const EditRuleForm: React.FC<EditRuleFormProps> = ({ afterSubmit, record }) => {
  const [form] = Form.useForm<{ name: string; regex: string }>();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <ModalForm<{
        name: string;
        regex: string;
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
          const res = await updateRule(params);
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
            name="regex"
            label="匹配规则"
            placeholder="请输入匹配规则"
          />
        </ProForm.Group>
      </ModalForm>
    </>
  );
};

export default EditRuleForm;
