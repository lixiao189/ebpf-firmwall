import { history } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="404 Not Found"
    style={{
      marginTop: '20vh',
    }}
    extra={
      <Button type="primary" onClick={() => history.push('/')}>
        返回
      </Button>
    }
  />
);

export default NoFoundPage;
