import { addRule } from '@/services/rule';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';

type AddRuleFormProps = {
  afterSubmit: () => void;
};

const AddRuleForm: React.FC<AddRuleFormProps> = ({ afterSubmit }) => {
  const [form] = Form.useForm<{ name: string; regex: string }>();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <ModalForm<{
        name: string;
        regex: string;
      }>
        title="新建规则"
        trigger={
          <Button type="primary">
            <PlusOutlined />
            新建规则
          </Button>
        }
        form={form}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
        }}
        submitTimeout={2000}
        onFinish={async (params) => {
          const res = await addRule(params);
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

export default AddRuleForm;
