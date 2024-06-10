import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button } from 'antd';
import UpdateUserForm from './editForm';

const SettingsPage: React.FC = () => {
  const name = localStorage.getItem('name');
  function logout() {
    localStorage.clear();
    // 清理 cookie
    document.cookie = "mysession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/';
  }

  return (
    <PageContainer
      ghost
      header={{
        title: '系统设置',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ProCard bordered title="登录设置" extra={<UpdateUserForm />}>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <strong>用户名</strong>: {name}
            </div>
            <Button onClick={logout}>退出登录</Button>
          </div>
        </ProCard>

        <ProCard bordered title="系统信息">
          <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
            <div>
              <strong>系统名称</strong>: 基于 eBPF 的 web 防火墙
            </div>
            <div>
              <strong>版本号</strong>: 1.0.0
            </div>
          </div>
        </ProCard>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
