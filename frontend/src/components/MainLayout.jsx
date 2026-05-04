import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd'
import {
  HomeOutlined,
  BarChartOutlined,
  PieChartOutlined,
  GlobalOutlined,
  TrophyOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Sider, Header, Content } = Layout

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return 'home'
    return path.substring(1)
  }

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页统计',
      onClick: () => navigate('/')
    },
    {
      key: 'production',
      icon: <BarChartOutlined />,
      label: '产量时长统计',
      onClick: () => navigate('/production')
    },
    {
      key: 'rating',
      icon: <PieChartOutlined />,
      label: '评分分析',
      onClick: () => navigate('/rating')
    },
    {
      key: 'location',
      icon: <GlobalOutlined />,
      label: '地点语言统计',
      onClick: () => navigate('/location')
    },
    {
      key: 'rankings',
      icon: <TrophyOutlined />,
      label: '导演演员排行',
      onClick: () => navigate('/rankings')
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    message.success('已退出登录')
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout
      }
    ]
  }

  return (
    <Layout className="layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="sider"
        width={220}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #334155'
        }}>
          {collapsed ? (
            <span style={{ color: '#60a5fa', fontSize: 20, fontWeight: 'bold' }}>M</span>
          ) : (
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>影视数据大屏</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="header-title">豆瓣影视数据可视化系统</div>
          <div className="user-info">
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#60a5fa' }} />
                <span>{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
