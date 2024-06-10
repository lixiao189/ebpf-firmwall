import { updateUser } from '@/services/user';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';

const UpdateUserForm: React.FC = () => {
  const [form] = Form.useForm<{ username: string; password: string }>();
  const [messageApi, contextHolder] = message.useMessage();

  const username = localStorage.getItem('name') as string;

  return (
    <>
      {contextHolder}
      <ModalForm<{
        username: string;
        password: string;
      }>
        title="编辑规则"
        trigger={<Button type="primary">修改用户</Button>}
        form={form}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
        }}
        submitTimeout={2000}
        onOpenChange={() => {
          form.setFieldsValue({ username });
        }}
        onFinish={async (params) => {
          const res = await updateUser(params);
          if (res.success) {
            messageApi.success('修改成功');
            setTimeout(() => {
              localStorage.clear();
              // 清理 cookie
              document.cookie = "mysession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              window.location.href = '/';
            }, 1000);
          } else {
            messageApi.error('修改失败');
          }
          return res.success;
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
          />

          <ProFormText.Password
            width="md"
            name="password"
            label="用户密码"
            placeholder="请输入用户密码"
          />
        </ProForm.Group>
      </ModalForm>
    </>
  );
};

export default UpdateUserForm;
