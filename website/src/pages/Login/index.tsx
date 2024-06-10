import { login } from '@/services/user';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginFormPage, ProFormText } from '@ant-design/pro-components';
import { Helmet, useAccess } from '@umijs/max';
import { message } from 'antd';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({}) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const LoginPage: React.FC = () => {
  const { styles } = useStyles();
  const [messageApi, contextHolder] = message.useMessage();

  const access = useAccess();
  if (access.canSeeAdmin) {
    setTimeout(() => {
      window.location.href = '/rules';
    }, 1000);
  }

  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        <Helmet>
          <title>登录页</title>
        </Helmet>

        <div
          style={{
            flex: 1,
            padding: '32px 0',
          }}
        >
          <LoginFormPage
            containerStyle={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(4px)',
            }}
            onFinish={async (values) => {
              const res = await login(values as API.LoginRequest);
              if (res.success) {
                window.location.href = '/rules';
              } else {
                messageApi.error('登录失败');
              }
            }}
          >
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder="用户名"
              rules={[
                {
                  required: true,
                  message: '请输入用户名!',
                },
              ]}
            />

            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder="密码"
              rules={[
                {
                  required: true,
                  message: '请输入密码!',
                },
              ]}
            />
          </LoginFormPage>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
