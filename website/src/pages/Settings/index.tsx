import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button } from 'antd';

const SettingsPage: React.FC = () => {
  const name = localStorage.getItem('name');

  return (
    <PageContainer
      ghost
      header={{
        title: '系统设置',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ProCard
          bordered
          title="登录设置"
          extra={<Button type="primary">修改</Button>}
        >
          <div
            style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}
          >
            <div>
              <strong>用户名</strong>: {name}
            </div>
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
